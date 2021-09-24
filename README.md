# Echo Camera Web
An Echo module for recognising tag numbers with a camera.

## First time development setup
1. Clone the repo
2. ```npm install```
3. ```npm run predev``` -> get your self-signed certificates
4. ```npm start``` -> a webpack dev server instance is available at https://localhost:3000


## Local development with EchopediaWeb
In order to test Smart Portal running locally under EchopediaWeb, a soft-link between the repos can be created with [yalc](https://www.npmjs.com/package/yalc).
1. (in Smart-Portal) ```npm run build```
2. (in Smart-Portal) ```npx yalc publish```
3. (in EchopediaWeb) ```npx yalc add @equinor/smart-portal```
4.  (in EchopediaWeb) ```npm install```
5. (in EchopediaWeb) ```npm start```
6. (in Smart-Portal) make your changes then ```npm run build && npx yalc push```

EchopediaWeb dev server will recompile and you changes should be reflected in the browser.

## Coding rules

-   Strive for **clean code** (and what to look for in code reviews/PRs)
    - Use well defined function/variable names. (A well defined name is much better than comments, which often quickly get outdated/obsolete)
    - Function names should tell what a function does. Bad: OnClick()/HandleOnClick() **Good: OpenTag()**
    - Avoid negative names. **Good: IsActive IsEnabled**. Bad IsInActive/IsDeactivated IsDisabled. If(IsEnabled) is eaier to read than if(!isDisabled) <- (double not)
    - Single Responsibility - A Function/Class should only do one thing. Split into sub functions.
    - Use **PURE** functions to Avoid hidden side effects. It also makes it a lot easier to add Unit Tests
    - **Avoid Code smells** like: Code duplication, Long method, Long class, Long parameter list. etc
    - **No Magic numbers** or strings! Bad: const time = 600000; **Good: const millisecondsInTenMinutes = 10 * 60 * 1000;**
    - Write code in a way that the compiler finds the BUGS! **Avoid ANY**. Define variables as optional/nullable in interfaces.
    - Try to split UI and Logic in different files. Ideally the UI shouldn't contain any logic. Logic also wants to get unit tested.
    - Favor functional programming over imperative programming: Use map, filter, find, etc instead of loops/ifs
    - Prefer **immutable** objects/interfaces
    - Avoid premature optimization - benchmark first.
    - Prefer undefined over null
-   **Fix** all **eslint warnings and errors** in your files.
-   Always checkin the code in better shape than you found it, fix/cleanup smaller things as you edit a file.

##  VS Code Extensions

### Must-have
- ESLint
- Prettier

### Suggested
- GitHub Pull Requests
- Import Cost
- SVG
- Version Lens
- Todo Tree
