import {HttpWrapper} from "@iWatchFootball/base-tools/http/httpWrapper";

export class LeagueAdapter {
    getOnePostcode = async (req: string): Promise<any | undefined> => {
        const http = new HttpWrapper({
            baseUrl: 'https://v3.football.api-sports.io'
    });
        const resp = await http.request<FullAddressResponse>({
            method: 'GET',
            path: `postcodes/${postcode}`
        });

        return resp.data;
    };}
