import wikiscrape
import sys
import os

title = sys.argv[1]
article = wikiscrape.wiki(title, "No")
temp_num = 0
for i in range(0,100):
    if os.path.exists(f"temp/temp{i}.txt"):
        os.remove(f"temp/temp{i}.txt")
f = open(f"temp/temp{temp_num}.txt", "w", encoding="utf-8")
f.write("Summarise the following text:\n")
count = 29
for paragraph in range(50, len(article.para2)):
    if not count > 7500:
        count += 1
        f.write(article.para2[paragraph])
    else:
        f.close()
        temp_num += 1
        if os.path.exists(f"temp/temp{temp_num}.txt"):
            os.remove(f"temp/temp{temp_num}.txt")
        f = open(f"temp/temp{temp_num}.txt", "w", encoding="utf-8")
        f.write("Summarise the following text:\n")
        count = 29

