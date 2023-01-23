import requests
from bs4 import BeautifulSoup
import re
import sys

#Taking the URL input and validating using Regex
URL = sys.argv[1]
print(URL)
urlRegex = re.compile(r"^https\:\/\/([\w\.]+)wikipedia.org\/wiki\/([\w]+\_?)+")
mo = urlRegex.search(URL)
if mo == None:
    print("Wrong URL entered. Make sure to enter a valid Wikipedia URL. Make sure to add https:// before the URL if you forgot.")
    exit()

#Requesting the HTML and making the BeautifulSoup object
req = requests.get(mo.group())
soup = BeautifulSoup(req.text, "lxml")

#Validating if the site has content
if soup.find("p").text.strip() == "Other reasons this message may be displayed:":
    print("This Wikipedia site does not exists.\n")
    exit()

#Retriving and printing the page title
page_title = soup.find("h1", class_="firstHeading").text

#Making the text file to save the text data
f = open("temp.txt", "w", encoding="utf-8")

#Topics to avoid
exclude = []
#exclude = ["See also", "References", "Sources", "Further reading", "External links", "Bibliography", "Spoken word", "Notes", "Filmography", "Discography"]

# Exclude the references container from the soup
references_container = soup.find_all("div", class_="reflist")
contents_container = soup.find_all("div", class_="toc")
footer_container = soup.find_all("footer", id="footer")
for container in references_container + footer_container + contents_container:
    container.decompose()
print("RUNNING")
for info in soup.descendants:
    if info.name == "span":
        try:
            if info["class"][0] == "mw-headline":
                headline = info.get_text()
                if headline not in exclude:
                    f.write(f"\n{headline}:\n")
        except KeyError: #try except block to handle BS KeyError
            pass
    elif info.name == "p":
        para = info.get_text()
        f.write(f"{para}")
f.close() #Closing the file


""" For pages which include few lists
#Scraping the site for headings and paragraphs
for info in soup.descendants:
    if info.name == "span":
        try:
            if info["class"][0] == "mw-headline":
                headline = info.get_text()
                if headline not in exclude:
                    print(f"{headline}:\n") #Printing the heading
                    f.write(f"\n{headline}:\n\n")
        except KeyError: #try except block to handle BS KeyError
            pass
    elif info.name in ["p", "ul", "ol"]:
        para = info.get_text()
        print(f"{para}") #Printing the paragraph
        f.write(f"{para}")
f.close() #Closing the file
"""
