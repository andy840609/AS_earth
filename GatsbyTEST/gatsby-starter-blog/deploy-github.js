const ghpages = require("gh-pages")

ghpages.publish(
  "public",
  {
    branch: "master",
    // repo: "https://github.com/andy840609/andy840609.github.io.git",
    repo: "https://github.com/andy840609/testPage",
  },
  error => {
    console.log(error)
    console.log("Deploy Complete!")
  }
)
