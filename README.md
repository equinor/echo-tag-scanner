# Echo Tag Scanner

An Echo module for recognising tag numbers with a camera.

Full documentation:
https://github.com/equinor/echo-camera-web/blob/dev/docs/index.md

## Maintenance
The Tag Scanner has a dev, qa and production pipeline. 

The Dev and QA pipelines are triggered whenever the `main` or `qa` branch are updated. 
For production, it is triggered manually with a Github release. It is suggested to use `qa` branch as the release target, but it may also be sufficient with `main`.
![image](https://github.com/user-attachments/assets/9128658c-3df1-4742-96fa-4f23211b0ce4)

_Please do note that the QA and Prod versions will require a rear-facing camera to start, so if you do try to use the Prod or QA versions with a webcamera, they will probably not work as they are classed as front-facing cameras. The Dev version has a built in exception._

## Future work
There is a [UI design update](https://dev.azure.com/EquinorASA/Echo/_backlogs/backlog/Ditto/Features?showParents=true&workitem=157462) planned and ready for implementation.

Otherwise, other bugs and improvements are recorded under [Operations](https://dev.azure.com/EquinorASA/Echo/_backlogs/backlog/Ditto/Features?showParents=true&workitem=50953)

## First time development setup

1. Clone the repo
2. ```npm install```
4. ```npm start``` -> a webpack dev server instance is available at https://localhost:3000

## Coding rules
This project has no contrived coding rules or best practices from AirBnb or whatever.
You are a professional, which means you code whichever way you want. This makes us all learn from each other.
##  VS Code Extensions

### Must-have

- ESLint

### Suggested

- GitHub Pull Requests
- Import Cost
- SVG
- Version Lens
- Todo Tree
