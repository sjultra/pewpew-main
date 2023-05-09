import fs from 'fs'

const tenant_id = process.env.TENANT_ID
const client_id = process.env.CLIENT_ID
const client_secret = process.env.CLIENT_SECRET
const AUTHORITY = `https://login.microsoftonline.com/${tenant_id}`
const GRAPH = `https://graph.microsoft.com`
const TOKEN_URL = `${AUTHORITY}/oauth2/v2.0/token`
const SIGN_INS_URL = `${GRAPH}/v1.0/auditLogs/signIns`
const LOOKUP_IP_URL = 'http://ip-api.com/json'
const LOOKUP_IP_LIMIT = 35

const PAYLOAD: Record<string, any> = {
    grant_type: "client_credentials",
    client_id: client_id,
    client_secret: client_secret,
    scope: "https://graph.microsoft.com/.default",
}

try {
    main()
} catch (error: any) {
    console.error(error);
    
}

async function main() {
    const accessToken = await getAccessToken()
    const signIns = await getSignIns(accessToken)
    
    
    const datapoints = await traceSignIns(signIns, false)

    console.log('[WRITE] writing datapoints to disk');
    await writeToDisk({data: datapoints})
    console.log('[WRITE] done.');
    
}

async function getAccessToken(): Promise<string> {
    console.log('Fetching ACCESS_TOKEN...');
    
    const response = await fetch(TOKEN_URL, {
        method: "POST",
        body: Object.keys(PAYLOAD).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(PAYLOAD[key])).join('&'),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
    })
    
    const body: any = await response.json()    
    console.log('Fetched ACCESS_TOKEN');
    return body["access_token"]

}

interface SignIn {
    ip: string,
    occurredAt: Date
}
async function getSignIns(accessToken: string): Promise<SignIn[]> {
    console.log('Fetching SIGN_INS...');
    const response = await fetch(`${SIGN_INS_URL}?${encodeURIComponent("$filter")}=${encodeURIComponent("createdDateTime ge 2023-10-17T21:00:00Z")}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
    })
    const body: any = await response.json()
    console.log('Fetched SIGN_INS');
    return body.value.map(({ ipAddress, createdDateTime }: { [key: string]: any }) => ({ ip: ipAddress, occurredAt: createdDateTime }))
}

//  hit: {
          //   origin: Coordinates,
          //   destination: Coordinates
          //  }
          //  strokeColor: string
          //  reason: string
interface Coordinates {
    latitude: number
    longitude: number
}

async function lookupIP(ip: string): Promise<Coordinates> {
    const response = await fetch(`${LOOKUP_IP_URL}/${encodeURIComponent(ip)}`)
    const body: any = await response.json()
    return {
        latitude: body.lat,
        longitude: body.lon,
    }
}

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

interface Hit {
    origin: Coordinates
    destination: Coordinates
}

interface DataPoint {
    hit: Hit
    strokeColor?: string
    reason?: string
}
async function traceSignIns(signIns: SignIn[], smoke: boolean = true): Promise<DataPoint[]> {
    console.log('Fetching destination IP info...');
    const destination = await lookupIP("67.180.150.47")
    console.log('Fetched destination IP info');

    let counter = 0
    let iteration = 1
    const origins: DataPoint[] = []
    for (const {ip, occurredAt} of signIns) {
        if (counter >= LOOKUP_IP_LIMIT) {
            if (smoke) {
                console.log("[SMOKE] smoke run completed.");
                break
            }
            console.log("[SLEEP] 62500ms/62.5s");
            await sleep(62500)
            counter = 0
            iteration += 1
        }

        if (counter === 0) {
            console.log(`Fetching IP info for ${LOOKUP_IP_LIMIT} IP addresses (batch ${iteration}/${Math.ceil(signIns.length/LOOKUP_IP_LIMIT)})`);
            
        }
        
        console.log(`Processing ${counter+1}/${LOOKUP_IP_LIMIT}`);

        const origin = await lookupIP(ip)
        const datapoint = {
            hit: {
                origin,
                destination
            }
        }
        origins.push(datapoint)
        counter += 1
    }
    return origins
}

async function writeToDisk(data: any) {
    return new Promise((resolve) =>
        fs.writeFile('data/data.json', JSON.stringify(data), 'utf8', resolve)
    )
}