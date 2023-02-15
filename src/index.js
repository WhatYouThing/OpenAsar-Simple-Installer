import fs from "fs"
import http from "snekfetch"

process.stdin.resume()

const folderNames = ["Discord", "Discord Canary", "Discord PTB"]
var installedClients = []
const appdataPath = process.env.LOCALAPPDATA

folderNames.map(async folder => {
    if (fs.existsSync(`${appdataPath}/${folder.replace(" ", "")}`)) {
        installedClients.push(folder)
    }
})

if (installedClients.length == 0) {
    console.log("\nFailed to find any Discord installation.")
    process.exit(0)
}

console.log("\nFound the following installations of Discord:")
installedClients.map((value, index) => {
    console.log(`${index + 1} - ${value}`)
})
console.log("\nInput the number of the client which you would like to install to.")

process.stdin.on("data", async data => {
    var number = parseInt(data.toString())
    if (!number || !installedClients[number - 1]) {
        return
    }
    var path = `${appdataPath}/${installedClients[number - 1].replace(" ", "")}`
    var resources
    fs.readdirSync(path).map(file => {
        if (file.toLowerCase().startsWith("app-")) {
            resources = `${path}/${file}/resources`
        }
    })
    if (!resources) {
        console.log("Failed to get the app folder.")
        process.exit(0)
    }
    if (!fs.existsSync(`${resources}/app.asar.backup`)) {
        console.log("Making a backup of the old app.asar file.")
        fs.copyFileSync(`${resources}/app.asar`, `${resources}/app.asar.backup`)
    }

    var asar = await http.get("https://github.com/GooseMod/OpenAsar/releases/download/nightly/app.asar")
    fs.writeFileSync(`${resources}/app.asar`, asar.raw)
    console.log(`OpenAsar installed successfully, hard restart Discord to see the change.`)
    process.exit(0)
})
