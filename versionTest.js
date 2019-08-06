const semver = require('semver')
const package = require("./package.json")

console.log("Checking version against semver...")

if (semver.valid(package.version) === null) {
    console.log("Not valid")
} else {
    console.log(`Version ${semver.valid(package.version)} valid`)
}
