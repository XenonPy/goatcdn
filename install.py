import urllib.request
import json
import os
import time
import zipfile
from rich.console import Console
from rich.markdown import Markdown
console = Console()
import sys

operation = sys.argv[1]

def pause():
    time.sleep(0.1)
with open('install.json', 'r') as f:
    # Load install.json
    installdata = json.load(f)
pkgs = installdata['packages']

def downloadAndInstall(pkgname, version="goat"):
    console.log(f"📦 🐐: Installing {pkgname}@{version if version != 'goat' and version != '' else ''}")
    pause()
    try:
        if version != "" and version != "goat":
            url = pkgs[pkgname]["versions"][version]
        else:
            url = pkgs[pkgname]["url"]
        console.log("📦 🐐: URL determined")
        pause()
    except KeyError:
        print('📦 🐐: Invalid package name or version!')
        exit()
    filename = pkgs[pkgname]["name"]
    console.log("📦 🐐: Filename determined")
    pause()
    urllib.request.urlretrieve(url, filename)
    console.log("📦 🐐: Downloaded archive!")
    pause()
    with zipfile.ZipFile(f"{filename}", 'r') as zip_ref:
        zip_ref.extractall("")
    console.log("📦 🐐: Extracted content")
    pause()
    os.system(f"rm {filename}")
    console.log("📦 🐐: Removed archive")
    pause()
def initGoat():     
    console.print("Welcome to Goat v0.1.0!", )
    pause()

initGoat()
if operation == 'install':
    with console.status("Doing all the things...", spinner="runner"):
        downloadAndInstall("a_goat_image", "burger")