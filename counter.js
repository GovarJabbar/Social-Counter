var puppeteer = require('puppeteer');

// get command args
var argv = require('minimist')(process.argv.slice(2));

(async() => {

    var social_counter = {}

    var browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    var page = await browser.newPage();

    // Facebook
    if (argv.facebook) {
        try {
            await page.goto(`https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2F${argv.facebook}&tabs&width=340&height=70&small_header=true&adapt_container_width=false&hide_cover=true&show_facepile=false&appId=248653853779476`);
            let div_selector_to_remove = "div div div div div div div div div div div div";
            await page.waitForSelector(div_selector_to_remove);

            await page.evaluate((sel) => {
                var elements = document.querySelectorAll(sel);
                for (var i = 0; i < elements.length; i++) {
                    elements[i].parentNode.removeChild(elements[i]);
                }
            }, div_selector_to_remove)


            var element = await page.waitForSelector('div div div div div div div div div div div');
            var value = await element.evaluate(el => el.textContent.split(' ')[0]);
            social_counter.facebook = value
                // console.log('Facebook Likes: ' + social_counter.facebook);
        } catch (error) {
            // console.error(error)
        }

    }

    // Instagram
    if (argv.instagram) {
        try {
            await page.goto(`https://www.instagram.com/${argv.instagram}`)
            var element = await page.waitForSelector('body div section main div header section ul li:nth-child(2) span');
            var real_number = await element.evaluate(el => el.getAttribute('title')); // Total Count
            social_counter.instagram = nf(real_number.match(/\d/g).join(""))

            // console.log('Instagram Followers: ' + social_counter.instagram);
        } catch (error) {
            // console.error(error)
        }
    }


    // Pinterest
    if (argv.pinterest) {
        try {
            const urlMetadata = require('url-metadata')
            urlMetadata(`https://www.pinterest.com/${argv.pinterest}/`).then(
                (metadata) => {
                    social_counter.pinterest = nf(metadata['pinterestapp:followers'])
                        // console.log('Pinterest Followers: ' + social_counter.pinterest)
                },
                (error) => {
                    // console.log(error)
                })
        } catch (error) {
            // console.error(error)
        }
    }


    // Youtube
    if (argv.youtube) {
        try {
            await page.goto(`https://www.youtube.com/channel/${argv.youtube}`)
            var element = await page.waitForSelector('yt-formatted-string#subscriber-count');
            var value = await element.evaluate(el => el.textContent.toUpperCase());
            social_counter.youtube = value.split(' ')[0]
                // console.log('Youtube Subscribers: ' + social_counter.youtube);
        } catch (error) {
            // console.error(error)
        }
    }

    // Telegram
    if (argv.telegram) {
        try {
            await page.goto(`https://t.me/${argv.telegram}`)
            var element = await page.waitForSelector('.tgme_page_extra');
            var value = await element.evaluate(el => el.textContent.toUpperCase());
            social_counter.telegram = nf(value.match(/\d/g).join(""))
                // console.log('Telegram Followers: ' + social_counter.telegram);
        } catch (error) {
            // console.error(error)
        }
    }

    // Twitter
    if (argv.twitter) {
        try {
            var page2 = await browser.newPage();
            await page2.goto(`https://platform.twitter.com/widgets/follow_button.21f942bb866c2823339b839747a0c50c.en.html#dnt=false&id=twitter-widget-0&lang=en&screen_name=${argv.twitter}&show_count=true&show_screen_name=true&size=m&time=1638803478789`)
            var element = await page2.waitForSelector('#count');
            var value = await element.evaluate(el => el.textContent.split(' ')[0]);
            social_counter.twitter = value
                // console.log('Twitter Followers: ' + social_counter.twitter);
        } catch (error) {
            console.error(error)
        }
    }


    // Linkedin
    if (argv.linkedin) {
        try {
            await page.goto(`https://www.linkedin.com/pages-extensions/FollowCompany?id=${argv.linkedin}&counter=bottom`) // for linkedin id go to your page profile -> click on See all X employees on LinkedIn -> you can see in url (currentCompany=) find your id there
            var element = await page.waitForSelector('.follower-count');
            var value = await element.evaluate(el => el.textContent);
            social_counter.linkedin = nf(value.match(/\d/g).join(""))
                // console.log('Linkedin Followers: ' + social_counter.linkedin)
        } catch (error) {
            // console.error(error)
        }
    }

    if (argv.key) {
        social_counter.key = argv.key
    }

    if (argv.url) {
        // console.log();
        await page.goto(`${argv.url}?${serialize(social_counter)}`)
    }

    console.log(social_counter);

    await browser.close();

    // await page.screenshot({ path: 'example.png' });
})();


const nf = n => {
    if (n < 1e3) return n;
    if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
    if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
    if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B";
    if (n >= 1e12) return +(n / 1e12).toFixed(1) + "T";
};

serialize = function(obj) {
    var str = [];
    for (var p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
}