:: Boots the front and back end of the project in 2 separate command windows
:: The "Batch Runner" extension can be used to run this from inside VS Code

@echo off
:: Start the front-end in a new command window
start cmd.exe /k "cd /d ../ufund-ui && ng serve"

:: Start the back-end in a new command window
start cmd.exe /k "cd /d ../ && mvn compile exec:java -f ./ufund-api/pom.xml"