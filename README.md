# Facts

This projects tries to solve common issue with documentations. It turns your issue tracker into project documentation. 

It requires you to rethink the way you create issues. Instead of "this button should save currently opened document " you write it as already implemented fact -  "the save button saves currently opened document".

Also documentation starts to reflect current state of the application. So it's becomes visible what part of the app is done and working, what are in progress, what is broken.

## How to run
### Install dependecies
From `client` and `server` folders
```
npm install
```

### Compile client app
From `client` folder
```
gulp default
```

### Start database server
```
    C:\mongodb\bin\mongod.exe --dbpath C:\mongodb\bin\data
```
### Start web server
From `server` folder
```
npm start
```

### Go to http://localhost:3000/

## License

Facts is Apache licensed. 