#!/usr/bin/python3

import requests
from bs4 import BeautifulSoup
import pdb
import json

data = []
output_file = "four_letters.json"
page = 2

URL = 'https://www.bestwordlist.com/4letterwords.htm'
webpage = requests.get(URL)
soup = BeautifulSoup(webpage.content, "html.parser")

container = soup.select('p')[3]
for block in container.find_all('span'):
    words = block.string.strip().split(' ')

    for word in words:
        data.append(word)

while page < 7:
    URL = 'https://www.bestwordlist.com/4letterwordspage%d.htm' %page
    print(URL)
    webpage = requests.get(URL)
    soup = BeautifulSoup(webpage.content, "html.parser")

    container = soup.select('p')[4]
    for block in container.find_all('span'):
        words = block.string.strip().split(' ')

        for word in words:
            data.append(word)
            
    page += 1

print("DONE")

with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)