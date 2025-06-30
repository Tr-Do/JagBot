import {getTuitionData} from "./core/scraper/tuition.js";

getTuitionData().then(data => {
    console.log("Tuition Data:", data);
}).catch(err => {
    console.error("Scraper", err);
})