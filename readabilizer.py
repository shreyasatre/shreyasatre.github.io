import requests
import dominate
import os
import PySimpleGUI as sg

from pathvalidate import sanitize_filename
from readability import Document
from dominate.tags import *
from dominate.util import raw

def make_html(article_url):

    response = requests.get(article_url)
    doc = Document(response.content)

    d_title = doc.title()
    d_short_title = doc.short_title()

    h_name = sanitize_filename(d_short_title)
    h_name = h_name[0:128] # keep filename at the maximum length of 128
    h_ext = ".html"

    d_css_file = "styles.css"
    d_css = ""
    with open(d_css_file, "r") as f:
        d_css = f.read()

    d = dominate.document(title=h_name)
    with d.head:
        style(raw(d_css), pretty=True)

    div_title = div(_class="title")
    div_title.add(h1(a(d_title, href=article_url)))
    d += div_title

    div_content = div(_class="content")
    div_content.add(raw(doc.summary()))

    d += div_content

    with open(os.path.join("articles", h_name + h_ext), "w", encoding="utf-8") as f:
        f.write(d.render(pretty=True))

    return h_name
# ---

# Processes the url.
def process_url(article_url):
    """Process the post url"""

    # An example url to an article
    # article_url = "https://www.washingtonpost.com/lifestyle/magazine/fatal-distraction-forgetting-a-child-in-thebackseat-of-a-car-is-a-horrifying-mistake-is-it-a-crime/2014/06/16/8ae0fe3a-f580-11e3-a3a5-42be35962a52_story.html"

    exported_file_name = make_html(article_url)

    return exported_file_name
# ---

# Gets the window layout.
def get_window_layout():
    # Layout for gui window.
    layout = [  [sg.Text("Link to an article")],
                [sg.Multiline(key="-INPUTURLS-", tooltip=" One link per line ", size=(73,10), autoscroll=True)], 
                [sg.Push(), sg.Button("Go"), sg.Button("Cancel")],
                [sg.Multiline("", size=(85,3), key="-MESSAGE-", 
                 disabled=True, autoscroll=True, background_color="#eee", font=("Consolas", 8))] ]

    return layout
# ---

def main():

    if os.path.exists("articles") == False:
        os.mkdir("articles")

    # Create the window.
    window = sg.Window("Download articles", get_window_layout(), finalize=True)
    message = window["-MESSAGE-"]
    message.update("Ready...")

    # Event loop to process "events" and get the "values" of the inputs
    while True:
        event, values = window.read()
        
        if event == sg.WIN_CLOSED or event == "Cancel": 
            # if user closes window or clicks cancel.
            break
        
        articles_urls_array = values["-INPUTURLS-"].splitlines()

        if len(articles_urls_array) == 0:
            window["-MESSAGE-"].update("Enter link(s) to reddit posts")
        else:
            try:
                for i in range(0, len(articles_urls_array)):
                    file_name = process_url(articles_urls_array[i])
                    if file_name == None:
                        message.update(message.get() + "\nUnexpected error.")
                    else:
                        message.update(message.get() + "\nExported: " + file_name)
            except IndexError as eIndex:
                print("IndexError: " + str(eIndex))
                message.update("IndexError: " + str(eIndex))
            except TypeError as eType: 
                print("TypeError: " + str(eType))
                message.update("TypeError: " + str(eType))
                sg.popup_error_with_traceback(f'An error happened.  Here is the info:', eType)
            except UnicodeEncodeError as eUnicodeEncode:
                print("UnicodeEncodeError: " + str(eUnicodeEncode))
                message.update("UnicodeEncodeError: " + str(eUnicodeEncode))
            except AttributeError as eAttributeError:
                print("AttributeError: " + str(eAttributeError))
                message.update("AttributeError: " + str(eAttributeError))
            except Exception as eXception:
                print("Exception: ", str(eXception))
                message.update("Exception: ", str(eXception))
                sg.popup_error_with_traceback(f'An error happened.  Here is the info:', eXception)

    # Close the window once loop is broken.
    window.close()
# ---

# Main program starts.
if __name__ == "__main__":
    main()
# ===