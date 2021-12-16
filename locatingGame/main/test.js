        // function GFontToDataURI(url) {
        //     return fetch(url) // first fecth the embed stylesheet page
        //         .then(resp => resp.text()) // we only need the text of it
        //         .then(text => {
        //             // now we need to parse the CSSruleSets contained
        //             // but chrome doesn't support styleSheets in DOMParsed docs...
        //             let s = document.createElement('style');
        //             s.innerHTML = text;
        //             document.head.appendChild(s);
        //             let styleSheet = s.sheet

        //             // this will help us to keep track of the rules and the original urls
        //             let FontRule = rule => {
        //                 let src = rule.style.getPropertyValue('src') || rule.style.cssText.match(/url\(.*?\)/g)[0];
        //                 if (!src) return null;
        //                 let url = src.split('url(')[1].split(')')[0];
        //                 return {
        //                     rule: rule,
        //                     src: src,
        //                     url: url.replace(/\"/g, '')
        //                 };
        //             };
        //             let fontRules = [],
        //                 fontProms = [];

        //             // iterate through all the cssRules of the embedded doc
        //             // Edge doesn't make CSSRuleList enumerable...
        //             for (let i = 0; i < styleSheet.cssRules.length; i++) {
        //                 let r = styleSheet.cssRules[i];
        //                 let fR = FontRule(r);
        //                 if (!fR) {
        //                     continue;
        //                 }
        //                 fontRules.push(fR);
        //                 fontProms.push(
        //                     fetch(fR.url) // fetch the actual font-file (.woff)
        //                         .then(resp => resp.blob())
        //                         .then(blob => {
        //                             return new Promise(resolve => {
        //                                 // we have to return it as a dataURI
        //                                 //   because for whatever reason, 
        //                                 //   browser are afraid of blobURI in <img> too...
        //                                 let f = new FileReader();
        //                                 f.onload = e => resolve(f.result);
        //                                 f.readAsDataURL(blob);
        //                             })
        //                         })
        //                         .then(dataURL => {
        //                             // now that we have our dataURI version,
        //                             //  we can replace the original URI with it
        //                             //  and we return the full rule's cssText
        //                             return fR.rule.cssText.replace(fR.url, dataURL);
        //                         })
        //                 )
        //             }
        //             document.head.removeChild(s); // clean up
        //             return Promise.all(fontProms); // wait for all this has been done
        //         });
        // };
        // GFontToDataURI("https://fonts.googleapis.com/css2?family=Merriweather&display=swap")
        //     .then(cssRules => {
        //         let fontRules = cssRules.join('\n');
        //         svg.append('defs').append('style').attr('type', 'text/css').text(fontRules);
        //         console.log(fontRules);
        //         updateChart();
        //         console.debug(svg.node())
        //     });