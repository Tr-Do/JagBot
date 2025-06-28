import fetch from 'node-fetch';
import cheerio from 'cheerio';

const TUITION_URL = 'https://www.tamusa.edu/paying-for-college/tuition/Cost-of-Attendance.html'

let cachedTution = null;
let lastFetchTime = 0;

export async function getTuitionData() {
    const now = Date.now()
    if (cacheTuition && now - lastFetchTime < 24*60*60*1000) {
        return cachedTution;
    }

    const res = await fetch(TUITION_URL);
    const $ = cherrio.load(await res.text());

    const data = {}
    
    $('table').each((_, table) => {
        const heading = $(table).prev('h2, h3').first().text().trim();
        if (!heading.includes("2025-2026")) return;

        $(table).find('tr').each((_, row) => {
            const cells = $(row).find('td');
            if (cells.length >= 2) {
                const key = $(cells[0]).text().trim();
                const val = $(cells[1]).text().trim();
                if (key && val) {
                    data[key] = val;
                }
            }
        });
    });

    cachedTution = data;
    lastFetchTime = now;
    return data;
}