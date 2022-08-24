# Echo Tag Scanner - ETS

## What is it
Echo Tag Scanner is a tool for scanning tag signs in the field. This makes it more convenient to look up information. 
It runs as a module under [EchopediaWeb](https://github.com/equinor/EchopediaWeb) and is available to all Echo users.

## Why create it
ETS was created as a replacement for the native app version. Because of new app store policies from Apple, it was no longer possible to host Echopedia and its native tag scanner by extension on App Store. Therefore, Echo Tag Scanner is built as a web app and bundled alongside EchopediaWeb.

## Minimum system requirements
The techincal requirements are twofold. It is based on the users device and the browser which runs on that device.

For browsers, we have established a rough minimum requirement based on the support of the [Media Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API).

- Chrome 55
- Android Chrome 55
- Edge 23
- Firefox 44
- Safari 11
- iOS Safari 11
- Opera 42

As for the device. It must run one of the browsers above, a working rear-mounted camera, and an internet connection.

## Who are the users
The scanner is available for all Echo users on all installations. A sizeable grouping of the userbase is working in an offshore setting, which means they might have a slow and congested internet connection.


## Overview
![image](https://user-images.githubusercontent.com/10920843/182129206-78893e1d-083d-44f0-b1a0-ecbb18baeb14.png)


### Scanner setup
This is the stage where we load up the UI, gain access to the device scanner and construct the scanner classes(linkto). 

The users will during their first visit be prompted to give access to their scanner device, which in turn gives us the opportunity to construct the classes. If the users clear their browser cache, visit with another browser or perhaps use a new device, they will be prompted again for permission.
If the user denies the request, we simply navigate them back to Echo. __(Subject to change)__

Once we have permission, we have to determine a fitting resolution for the scanner. Prior to the request, there is no way of knowing the capabilities of the scanner we want to use and instead, we have to rely on setting constraints to our scanner requests. We then put in a request for the scanner running at a certain resolution, at a certain framerate and with no audio channels.

The framerate can be anything between 15 and 60 frames per second, and as the users will do a scanning operation, we will go for the highest possible framerate. At the time of writing, most devices should be capable of at least 30 frames per second.

The resolution has a pitfall in that we obviously cannot request a resolution which is higher than what the device is capable of, but we also have no idea what the maximum resolution is. One strategy would be to let the MediaCapture API set the highest possible resolution, but another pitfall here is that the resolution could be unnecessarily large and the postprocessor would have to do more downscale operations later.

The preferred strategy then is a middle-road approach. We set the minimum resolution to be close or equal to the [viewport](https://developer.mozilla.org/en-US/docs/Glossary/Viewport) dimensions (the dimensions are expressed in [CSS Pixels](https://hacks.mozilla.org/2013/09/css-length-explained/)). We also use this as the ideal resolution. (__subject to change__). 

When we have obtained permission from the users, we can then construct a MediaStream object which is then used to construct our classes. The class structure aims to emulate a physical digital camera, with the last class (Scanner), calling the parents in a repetable manner which in turn emulates a scanning operation.

With the mediastream object, we can assign it as a source to a standard HTML video element. We are then streaming from the device camera to a video element, emulating a viewfinder.

Finally, we also define a "capture area", which the users can identify as a marked area in their viewfinder. When a capture happens, only whatever is inside the capture area is captured.
![image](https://user-images.githubusercontent.com/10920843/182128953-55f21653-bc05-47eb-915a-8254e0f7d5de.png)

### Camera capture
In this stage, we are capturing a frame from the video stream before putting it in memory. In order for this to work, the scanner features a hidden canvas element which is used for temporary storage between postprocessing operations.

With the predefined capture area, we capture a frame from the video stream and store it on the hidden canvas.

### Postprocessing
The goal of the postprocessing steps is to reduce the initial capture sizes to below 50KiB or as much as possible without too much sacrifice in the quality of the captures. The postprocessor implements a couple of different approaches:

- Downscaling
- Cropping
- Lossy compression
- Recolouring (grayscale or black&white)

While recolouring is good for an even more efficient compression, they can also detriment the capture qualities to the point where the text becomes unreadable. This is especially true for black&white. The fundamental goal is to optimize the clarity of the textual content, meaning in practice, the text is coloured black and everything around has a significantly different coloyr, like white or gray.

In practice though, parts of the text can wind up being whitened or grayscaled because of a challenging environment.

### OCR
In this step, we use an OCR technology to extract textual content from the captures into strings. Azure Computer Vision handles this step. Azure CI currently uses a general-purpose recognition model. This model is in reality trained on reading documents where you will typically find traditional fonts and clear distinctions between the foreground and background, but an average tag sign should have similar levels of clarity and have standardized fonts. This might change in the future. (see # future improvements)

Currently, the OCR-step happens in the cloud, but there is alternatively the option of deploying an on-prem version. The scanner does not however have significant latency-oriented issues.

### Filtering and validation
The goal of the filtering step is to take whatever textual content we got from OCR, and filter away the things which we roughly do not perceive as tag numbers. The ruleset is as followed:

- The first two characters is a number
- The string should be at least 4 characters
- It should contain alphanumeric characters and/or one or more hyphens (-)

After the rough filtering step, we run a more expensive validation step to filter out or correct false positives. This step is handled by Echo-Search __(link)__.

### Result presentation
The UI is built using React and we have strived to keep it seperate from the capture logic. The UX and design choices are largely inherited from the native app.

## How to get reliable scanning results
The fundamental goal of the scanner is to get as many positive results as possible. The end-users have a general understanding of the challenge, but with the prevalent OCR implementations, they have high expectations in speed and accuracy.
The scanner is faced with challenges, some of which we can mitigate and some which are left to mercy.

### The user has a slow connection
This is one of the fundamental challenges we face. The potential consequence is that the user could be left waiting for a response for a time, they might then pull on the handbrake and try again, or conclude that the scan attempt failed. In reality, the process was still ongoing and was bottlenecked at the stage where the captures are being relayed for OCR-service. 

The solution to this problem is to then make the captures as small as possible to minimize the potential bottleneck.

### The user is in a challenging environment
A challenging environment is an environment where the user is not able to get an optimized view of the tag sign. This could be factors like bad lighting (not enough lighting or too much lighting), the tag sign could be far away or the user is required to scan in challenging angles.

The camera ships with torch and zoom functionality, albeit this is not supported in Safari browsers. In practice, this means torch and zoom is not available on iOS devices because all web browsers on iOS uses the WebKit engine.

Users with an iOS device will have to be instructed to bring a seperate light source if neccessary. It is not possible to turn on the torch in the phone settings and simultanously use the scanner.

As for zoom, while this is helpful for the users, it is a digital zoom. A digital zoom is essentially a process where you crop a section of the image, upscale it to match the original dimensions and present it. This gives you the illusion of an optical enlargement, but it sacrifices clarity.

### Approaches to optimizing results
The scanner employs a "try-again" approach where we initially take a select number of captures over a certain time period, effectively mimicking a scanning operation. With these captures, we can employ different postprocessing techniques and relay for OCR. 

## Future improvements

### Capturing
The users expect everything to happen fast. Even though the scanning is pretty fast in its current state, improvements can be made. The capture process, or rather the scanning process where we do multiple captures, can be improved by running the capture processes in paralell, rather than in sequence. 

We already have a static "scanning period" set, and we fundamentally can't expedite this. All the captures may however not be done within this timeframe, depending on the device. If the scanning period is set to 2 seconds, a slower device may not be actually done before 3 seconds have passed. 

Even though this will improve things, it will complicate the code base. This improvement therefore, has diminishing returns.

### Capture analysis
Currently, we take a series of captures, run them through postprocessing and finally relay for OCR. What if we could look at our selection of captures and determine which one is "the best?". If we can determine "the best", then we can relay that to OCR. The defintion of "the best" can be left for later, but we have previously looked into different blur detection techniques. (list links)

### On-device OCR
On-device OCR allow us to run the entire process on the device itself, which in turn allow for offline usage. This will effectively rid us of the slow connection problem, leaving us with just the device itself as a factor. In addition, one could also employ a third-party OCR provider as a fallback if the device itself is not able to.


### Determine connection quality
In production, the scanner will run in an environment with differing connection qualities. Some users will use it onshore with good bandwidth, and some users will use it offshore with a concested internet connection or a weak 4G signal. The signal may be so weak that the real-world bandwidth dips into Edge/3G territory.
Knowing about the users connection quality would be invaluable information.

### Barcode scanning
New installations like Wisting might futureproof their installations by using barcodes in addition to tag numbers. Barcodes are, by design, relatively easy to read.
