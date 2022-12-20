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
This is the stage where we load up the UI, gain access to the device scanner and construct the scanner classes. 

The users will during their first visit be prompted to give access to their scanner device, which in turn gives us the opportunity to construct the classes. If the users clear their browser cache, visit with another browser or perhaps use a new device, they will be prompted again for permission.
If the user denies the request, we simply navigate them back to Echo. __(Subject to change)__

Once we have permission, we have to determine a fitting resolution for the scanner. Prior to the request, there is no way of knowing the capabilities of the scanner we want to use and instead, we have to rely on setting constraints to our scanner requests. We then put in a request for the scanner running at a certain resolution, at a certain framerate and with no audio channels.

The framerate can be anything between 15 and 60 frames per second, and as the users will do a scanning operation, we will go for the highest possible framerate. At the time of writing, most devices should be capable of at least 30 frames per second.

The resolution has a pitfall in that we obviously cannot request a resolution which is higher than what the device is capable of, but we also have no idea what the maximum resolution is. One strategy would be to let the MediaCapture API set the highest possible resolution, but another pitfall here is that the resolution could be unnecessarily large and the postprocessor would have to do more downscale operations later.

Through testing and experimenting, we have found 720p to be a good compromise between size and clarity if the user can get up close to the tag sign. If the user is on a particularly slow network, a downgrade to 480p would be a good idea. Unfortunately, we do not have a way of knowing the users connection quality at the present time.

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

While recolouring is good for an even more efficient compression, they can also detriment the capture qualities to the point where the text becomes unreadable. This is especially true for black&white. The fundamental goal is to optimize the clarity of the textual content, meaning in practice, the text is coloured black and everything around has a significantly different colour, like white or gray.

In practice though, parts of the text can wind up being whitened or grayscaled because of a challenging environment.

### OCR
In this step, we use an OCR technology to extract textual content from the captures into strings. Azure Computer Vision handles this step. Azure CI currently uses a general-purpose recognition model. This model is in reality trained on reading documents where you will typically find traditional fonts and clear distinctions between the foreground and background, but an average tag sign should have similar levels of clarity and have standardized fonts. This might change in the future. (see # future improvements)

Currently, the OCR-step happens in the cloud, but there is alternatively the option of deploying an on-prem version. The scanner does not however have significant latency-oriented issues.

### OCR post-processing
This step is aiming to analyze the OCR-result and optionally do various sub-steps in the form of corrections and filters to letters, words and lines of words. There is a ruleset defined known as __tag format rules__:

- The string can contain the Latin letters A-Z, all uppercased and the numbers 0-9.
- The string must contain at least two numbers.
- The string must be at least 4 characters.
- The string must be uppercased.
- The string cannot contain a leading or trailing special character.
- The string can contain one or more of the following special characters: -_."
- The string can be of the following special types:
  - A motor tag, meaning it must obey the tag format rules, but also contains one and only one sequence of "(M)" somewhere inside the word.
  - A "C-tag", the same as motor tag, but with the sequence "(C)" instead.

### Homoglyph substitution
In typography, a homoglyph is "one of two or more graphemes, characters, or glyphs with shapes that appear identical or very similar".
The most common example are the characters "0" (numeric zero) and "O" (uppercased Latin O).

In this step, we can look at the characters in the words and identify particular characters which we can confidentally replace with another character.
For example, we cannot replace an instance of "0" (numeric zero) with an uppercased "O" because they are both accepted characters in the tag format ruleset. We can however replace an instance of "$" (the dollar currency symbol) with an uppercased S because the dollar symbol is not amongst the accepted characters.

Furthermore, we can make some assumptions on the nature of the OCR-service. Our OCR service is a document reader configured to read Latin english. Therefore, we can assume it will not commonly return letters outside the english alphabet, it will return Arabic numerals 0-9 and a set of alphanumeric characters that usually appears in western word processing.

#### Homoglyph substitutions
The table below shows a set of alphanumeric characters in the left column and a singular substitution character. 

_Updated 20-12/2022_
| Homoglyphs | Substitution |
|------------|--------------|
| ฿          | B            |
| < © €      | C            |
| [ ] ! \|   | I            |
| }] )       | J            |
| £          | L            |
| ₽          | P            |
| Ⓡ &       | R            |
| ? § ¿ $    | S            |
| ±          | T            |
| µ          | U            |
| ¥          | Y            |
| \| !       | 1            |
| ?          | 2            |
| >          | 7            |


After the rough filtering step, we run a more expensive validation step to filter out or correct false positives. This step is handled by [Echo-Search])(https://github.com/equinor/EchoSearch).

### Result presentation
The UI is built using React and we have strived to keep it seperate from the capture logic. The UX and design choices are largely inherited from the native app.

## How to get reliable scanning results
The fundamental goal of the scanner is to get as many positive results as possible. The end-users have a general understanding of the challenge, but with the familiarity that users have of this technology these days, for example for translating a restaurant menu abroad, they have high expectations in speed and accuracy.
The scanner is faced with challenges, some of which we can mitigate and some which are left to mercy.

### The user has a slow connection
This is one of the fundamental challenges we face. The potential consequence is that the user could be left waiting for a response for a time, they might then pull on the handbrake and try again, or conclude that the scan attempt failed. In reality, the process was still ongoing and was bottlenecked at the stage where the captures are being relayed for OCR-service. 

The solution to this problem is to then make the captures as small as possible to minimize the potential bottleneck.

### The user is in a challenging environment
A challenging environment is an environment where the user is not able to get an optimized view of the tag sign. This could be factors like bad lighting (not enough lighting or too much lighting), the tag sign could be far away or the user is required to scan in challenging angles.

The camera ships with torch and zoom functionality, albeit this is not supported in Safari browsers. In practice, this means torch is not available on iOS devices because all web browsers on iOS uses the WebKit engine. Users with an iOS device will have to be instructed to bring a seperate light source if neccessary. It is not possible to turn on the torch in the phone settings and simultanously use the scanner.

As for zoom, while this is helpful for the users, it is a digital zoom. A digital zoom is essentially a process where you crop a section of the image, upscale it to match the original dimensions and present it. This gives you the illusion of an optical enlargement, but it sacrifices clarity.

### Approaches to optimizing results
The scanner employs a "try-again" approach where we initially take a select number of captures over a certain time period, effectively mimicking a scanning operation. With these captures, we can employ different postprocessing techniques and relay for OCR. 

## Future improvements
[This document](https://github.com/equinor/echo-tag-scanner/blob/main/docs/roadmap.md) outlines a set of future improvements.

## How the cropping works
As an attempt to minimize capture sizes, the scanner has a defined "scanning area". This area defines a region of the viewfinder which will be cropped before being further processed. A basic graph is in order here to explain how it works.

![image](https://user-images.githubusercontent.com/10920843/207258606-0122942b-4c01-493e-b388-3ccd5da3ac86.png)

- The __camera feed__ is as suggested the video feed which is streamed from a camera device to a video element. The camera feed is configured to run in 720p resolutions.
- The __viewfinder__ represents the part of the camera feed which is visible to the user.
- The __scanning area__, as mentioned, is a region of the viewfinder which will be cropped before further processing.
- The __viewport__ is the users visible area of a web page. As of v2.2.1, the __viewfinder__ makes up most of the viewport with the exception of the Echo menubars.

In order to perform a crop on the viewfinder, we must find a start point as plane coordinates (x, y), a crop width and a crop height.
The crop height and crop width, ie crop dimensions, is found by querying the scanning area elements clientHeight and clientWidth which gives us the dimensions without padding and borders.

The coordinates are found with a manual calculation (see graph above for formula). If the camera feed, viewfinder and scanning area are placed in a coordinate system, the origo of the system becomes the top left of the camera feed, and from there we find the (x, y).

This approach does have some drawbacks:
- The __scanning area__ must be centered vertically and horizontally in the __viewport__.
- The __camera feed__ (ie the camera resolution) cannot be smaller than the __viewport__ (a possible problem on large tablets).

## Zooming
A requested feature is the ability to zoom the camera because some tag signs are situated farther away. The ability to digitally zoom a camera feed is currently known to be in Chromium. This ability is however not present in the [W3 Image Capture spec](https://www.w3.org/TR/mediacapture-streams/#def-constraint-sampleSize), so not all browsers are supporting this.

In order to give users cross-platform zoom capability, the tag scanner operates with a __native__ and a __simulated__ procedure.

## Native zoom
A native zoom is performed by refreshing the running video track with a [constraint value](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints) for zoom. This built in behavior is likely cropping the camera frames before they are streamed to the video element, giving the users the illusion of a zoomed camera. It appears no built-in postprocessing is done here.

## Simulated zoom
In order to support zooming on browsers which haven't implemented zoom constraints, the tag scanner has the ability to do this manually. This is in principle very simple as we want to achieve what the native zoom is doing, giving the users the illusion of a zoomed viewfinder. Since the viewfinder is a video-element, we can leverage the CSS scale transform to "blow up" the element size while staying performant.

However, the scale transform will not alter the video element's intrinsic dimensions, which is expressed in __videoWidth__ and __videoHeight__. These dimensions is what is used with the cropping behaviour (recommened reading beforehand). 

Essentially, for a 2x simulated zoom, half of the viewfinder is now outside the viewport and as a result, we have to recalculate the starting point and the crop dimensions. Since the viewfinder in this example is zoomed 2x, the cropping dimensions then becomes half of what they are at 1x because we do not scale down the scanning area element itself. The cropping coordinates will also shift along the x and y-axis since the viewfinder is scaled up.

The diagram below shows the calculations. It is important to consider that the viewfinder has been __visually__ scaled up from the users perspective, but its instrinsic dimensions are always the same. The crop dimensions simply becomes half of the scanning area width and height.

![image](https://user-images.githubusercontent.com/10920843/207294106-3070ce9b-3810-4109-8715-0d7d7ac01546.png)



## Logging

### How to see number of users per month.
![image](https://user-images.githubusercontent.com/10920843/189661348-705f11d6-dbe9-47d8-b213-e8cc7fd3b0d4.png)

### How to see scanning logs
The tag scanner logs all scanning attempts. Provided under are KQL query that can be run in the shared or prod App Insights query designer.

```kql
// Displays a single row showing the number of failed scanning sessions the last 60 days.
customEvents
| where timestamp > now() - 60d
| where name == "ep_ets.Scan.ScanAttempt"
| project scanAttempt = customDimensions, scanId = tostring(customDimensions["id"])
| where scanAttempt["isSuccess"] == "false"
| distinct scanId
| summarize count()

// Displays a single row showing the number of successful scanning sessions the last 60 days.
customEvents
| where timestamp > now() - 60d
| where name == "ep_ets.Scan.ScanAttempt"
| project scanAttempt = customDimensions, scanId = tostring(customDimensions["id"])
| where scanAttempt["isSuccess"] == "true"
| distinct scanId
| summarize count()

// Get a list of scan sessions for a given period (defaults to 24 hours)
customEvents
| where name == "ep_ets.Scan.ScanAttempt"
```

## Logging tools
The scanner comes with logging tools that can be utilized by developers and testers. ETS can do log operations to the console depending on which environment it is running on. The current environments are LocalDevelopment, EchoDevelopment, QA and Prod. The difference between LocalDevelopment and EchoDevelopment is that in EchoDevelopment, the code is running in EchopediaDev. In LocalDevelopment, the code is running locally on the developers computer.

In order to do a selective console log, the developer can do something like this:
```
logger.log('EchoDevelopment', () => {
    console.log(
      'I will run if the env is EchoDevelopment or LocalDevelopment'
    );
  }); 
  ```
As the log entry suggests, the console log will be invoked in both EchoDevelopment and LocalDevelopment because LocalDevelopment is "below".
