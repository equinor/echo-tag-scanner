#!/bin/bash

#https://www.freecodecamp.org/news/how-to-implement-runtime-environment-variables-with-create-react-app-docker-and-nginx-7f9d42a91d70/
#

# Recreate config file
rm -rf ./env-config.js
touch ./env-config.js

echo "creating env-config.js"

# Add assignment 
echo "window._env_ = {" >> ./env-config.js

# Read each line in .env file
# Each line represents key=value pairs
while read -r line || [[ -n "$line" ]];
do
  #only process lines containting =
  if [[ $line == *"="* ]]; then

    # Split env variables by character `=`
    if printf '%s\n' "$line" | grep -q -e '='; then
      varname=$(printf '%s\n' "$line" | sed -e 's/=.*//')
      varvalue=$(printf '%s\n' "$line" | sed -e 's/^[^=]*=//')
    fi

    # Read value of current variable if exists as Environment variable
    value=$(printf '%s\n' "${!varname}")
    # Otherwise use value from .env file
    [[ -z $value ]] && value=${varvalue}
  
    # Append configuration property to JS file
    echo "  $varname: \"$value\"," >> ./env-config.js

    #print variables
    valueObfuscated=$(printf '%s' "$value" | cut -c 1-3)
    #echo "  $varname: \"$value\"," #print the environment variables
    echo "  $varname=\"$valueObfuscated***\"," #print the environment variables obfuscated
  fi
done < .env

echo "}" >> ./env-config.js

#if directory exists, copy to public folder. Needed for dev enironment (npm start)
if [ -d "public" ]; then
  rm -rf ./public/env-config.js
  cp ./env-config.js ./public/env-config.js
fi

echo "done creating env-config.js"