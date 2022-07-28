# Echo Camera Web

## What is it
Echo Camera is a tool for scanning tag signs in the field. This makes it more convenient to look up information. 
It runs as a module under [EchopediaWeb](https://github.com/equinor/EchopediaWeb) and is available to all Echo users.

## Why create it
Echo Camera was created as a replacement for the native app version. Because of new app store policies from Apple, it was no longer possible to host Echopedia and its native tag scanner by extension on App Store. Therefore, Echo Camera is built as a web app and bundled alongside EchopediaWeb.

## Who are the users


## Architecture

### Overview
![image](https://user-images.githubusercontent.com/10920843/181489941-cabdc484-5b26-4bb5-97a8-33d569990981.png)

#### Camera setup
This is the stage where we load up the UI, gain access to the device camera and construct the camera classes(linkto). 

The users will during their first visit be prompted to give access to their camera device, which in turn gives us the opportunity to construct the classes. If the users clear their browser cache, visit with another browser or perhaps use a new device, they will be prompted again for permission.
If the user denies the request, we simply navigate them back to Echo. __(Subject to change)__

Once we have permission, we have to determine a fitting resolution for the camera. Prior to the request, there is no way of knowing the capabilities of the camera we want to use and instead, we have to rely on setting constraints to our camera requests. We then put in a request for the camera running at a certain resolution, at a certain framerate and with no audio channels.

The framerate can be anything between 15 and 60 frames per second, and as the users will do a scanning operation, we will go for the highest possible framerate. At the time of writing, most devices should be capable of at least 30 frames per second.

The resolution has a pitfall in that we obviously cannot request a resolution which is higher than what the device is capable of, but we also have no idea what the maximum is. The strategy would be to let the MediaCapture API set the highest possible resolution, but another pitfall here isthat the resolution would be unnecessarily 


```markdown
Syntax highlighted code block

# Header 1
## Header 2
### Header 3

- Bulleted
- List

1. Numbered
2. List

**Bold** and _Italic_ and `Code` text

[Link](url) and ![Image](src)
```
