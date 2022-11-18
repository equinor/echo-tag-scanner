# Echo Tag Scanner roadmap
The purpose of this document is to outline future improvements and features that aims to improve the scanner's known pain points, which include:

1. The users will work in the field, and may have a bad internet connection.
2. The users may be using older devices.
3. The scanner hit rate is too low for various reasons (this is not yet confirmed at the time of writing)

## An outline of improvements and features
Below follows an outline of suggested improvements and features that contributes towards solving the pain points.

### Targeted improvements to signs
This is both insight and development. There appears to be no clear standard for what a tag sign looks like in the field. 

Some factors include:
- Different backgrounds, typically white, red, yellow or metallic
- Different font families, (including hand-written)
- The font can be serifed or sans serifed (unconfirmed at the time of writing)
- The signs can be mounted at different angles (although hopefully not upside-down)
- The signs can be heavily worn after exposure to the elements.
- The signs can otherwise be of a special format; line tag signs is an [example](https://dev.azure.com/EquinorASA/DT%20%E2%80%93%20Digital%20Twin/_boards/board/t/Ditto/Stories/?workitem=89356)

With an overview of these factors, the scanning process can be further improved. At the time of writing (ca v2.1.1), the scanner is developed in an office environment with tag signs that are very clear and contains one or more tag numbers.

### Parallel Captures
The users expect everything to happen fast. Even though the scanning is pretty fast in its current state, improvements can be made. The capture process, or rather the scanning process where we do multiple captures, can be improved by running the capture processes in paralell, rather than in sequence. 

We already have a static "scanning period" set, and we fundamentally can't expedite this. All the captures may however not be done within this timeframe, depending on the device. If the scanning period is set to 2 seconds, a slower device may not be actually done before 3 seconds have passed. 

Even though this will improve things, it will complicate the code base. This improvement therefore, has diminishing returns on fast devices; but since field devices can have a tendency to be a few years old, they will benefit from this.

### Post-capture analysis
Currently, we take a series of captures, run them through postprocessing and finally relay for OCR. What if we could look at our selection of captures and determine which one is "the best?". If we can determine "the best", then we can relay that to OCR. Without having done much analysis of which capture can be defined as "the best", one can initially assume "the best" capture is the one which has the least amount of blur. 

This new feature is highly worth doing to address one of our main pain points which is bad network quality.
Edit: After implementing zoom, this feature becomes more important because a zoomed view will increase the chances of a capture being blurred.

### On-device OCR
On-device OCR allow us to run the entire process on the device itself, which in turn allow for offline usage. This will effectively rid us of the slow connection problem, leaving us with just the device itself as a factor. An On-device service could be Tesseract, Google Firebase, Tensorflow, Text Detection Web API and more.

This implementation of this feature is very complex, but it does completely solve the issues of having slow internet connection, and also introduces offline scanning as a seperate feature. The alternative to this is to work around the potential connection issues with the other improvements outlined here. For field work, using a third-party OCR service will never surpass On-device OCR, but one can define acceptable criterias while also communicating (UX) to the users.

### Determine connection quality
In production, the scanner will run in an environment with differing connection qualities. Some users will use it onshore with good bandwidth, and some users will use it offshore with a congested wifi internet connection or a weak 4G signal. The signal may be so weak that the real-world bandwidth dips into Edge/3G territory.

Knowing about the users connection quality would be invaluable information. This information can be used to create a more tailored tag scanner instance with regards to the camera resolution, how much zooming is allowed, how many captures are taken in a scan process and UX improvments.

## Barcode scanning
Some installations may provide barcodes in addition to tag numbers. Barcodes are, by design, relatively easy to read. 

## Improved UX
The tag scanner has a UI and UI behavior that was borrowed from the scanner it replaced, which was also a flawed approach. The old tag scanner was an on-device scanner and did not have the additional pain points outlined in this document. These fundamental problems leads us to the necessity of iterating the UX again with an emphasis on the users of the camera being out in the field in challenging conditions.

Thie should absolutely be done and would not take too much time from a designer. They might want to do some user interviews, but their primary task would revolve around how we communicate with the users during the scanning process itself, for example, how do we communicate failed hits or a slow scanning process to them.

## A custom trained OCR
As of the time of writing (ca v2.1.1), the scanner is connected to Azure Computer Vision which is a general-purpose document reader. This resource was chosen because we had an urgent need of an OCR-service because of approaching deadlines (the release of V2.0.0).

The question today is wether or not this general purpose OCR-service is sufficient for our needs or if we have potential gains in training. The problem could be that we are not providing clear enough material for it to work with. If we want to train, we will have to look for another third-party OCR service as Computer Vision does not provide a means to use a custom model.

## Improve capture recolouring
This feature is partly implemented today and it is a process of recolouring an image so that it uses a less variety of colours, while still preserving its clarity. The reason why we want to do this is so that a compression algorithm will have an easier time making the captures smaller. 

The implementation today can recolour captures to grayscale (different shades of gray) or black&white. The problem we have been facing is that these postprocesses can have a tendency of sacrificing too much clarity from the captures.

## A recommendation as of 18th of November, 2022
As mentioned under On-device OCR heading, the use of On-device OCR completely eliminates pain point #1 and introduces offline scanning as a side effect.
There is however a problem of not only implementing it which may take several sprints to complete and will introduce several new bugs, but one has to also provide an OCR model alongside the OCR code itself.

A silver bullet to this problem would be the (Text Detector API)[https://developer.chrome.com/articles/shape-detection/], which is an OCR-service built straight into the browser in which the tag scanner is running on. This service will use the models that are included in modern operating systems like iOS and Android. The Shape Detection API is currently only available behind a flag in Chrome.

The general recommendation would be to continue working on improving the hit rate today using Azure Computer Vision. In a longer-term perspective, the OCR-provider can be switched from Computer Vision to Shape Detection API. It is today possible to start the implementation of Shape Detection API so that it runs alongside Computer Vision. If a user's browser does support Shape Detection, they will automatically use it over Computer Vision.

Recommended actions in order to adress the pain points while we wait for Shape Detection API:
- Consider implementing *Parallel Captures* to speed up slower devices. (We still don't know much about the field devices)
- Implement *Post-capture analysis* to avoid relaying several captures.
- Improve *Capture Recolouring* to reduce the sizes of the captures.
- Do *Improved UX*
- Implement Computer Vision API 4.0
