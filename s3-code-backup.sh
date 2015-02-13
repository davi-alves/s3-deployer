#!/bin/bash

# colors
red='\033[1;31m';
green='\033[0;32m';
cyan='\033[1;30m';
NC='\033[0m'; # No Color

# get base dir
if [ -L $0 ] ; then
    dir=$(dirname $(readlink -f $0)) ;
else
    dir=$(dirname $0) ;
fi ;

# get node executable
if hash node 2>/dev/null; then
    NODE=$(command -v node);
    echo -e "${green}Node.js $(node -v) found in ${NODE}${NC}";
else
    echo -e "${red}You need Node.js installed to run this script.${NC}";
    exit 1;
fi

echo -e "${green}Starting script...${cyan}";
echo;
$NODE "${dir}/app.js";
echo;
echo -e "${green}Script finished.${NC}";
