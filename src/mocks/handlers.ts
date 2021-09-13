import { rest } from 'msw';
import page1 from './page1.json';
import page2 from './page2.json';
import page3 from './page3.json';

export const handlers = [
    rest.get('https://gateway.marvel.com/v1/public/characters', (req, res, ctx) => {
        const query = req.url.searchParams
        const apikey = query.get("apikey")
        const offset = query.get('offset')
        const nameStartsWith = query.get('nameStartsWith')

        let json = page1;

        switch (offset) {
            case '20':
                json = page2
                break;

            case '40':
                json = page3
                break;

            default:
                json = page1
                break;
        }

        return res(ctx.status(200), ctx.delay(500), ctx.json(json))

    }),

]