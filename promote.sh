#!/bin/bash
echo -e "\e[44m * Fetching repository… * \e[49m\n"
git fetch
echo -e "\e[44m * Pulling… * \e[49m\n"
git pull
echo -e "\e[44m * git status: * \e[49m\n"
git status
echo -e "\e[44m * Rebuild client app * \e[49m\n"
cd ./client
npm run build-prod
cd ../
echo -e "\e[44m * Restart apps… * \e[49m\n"
docker exec -i kopay_client pm2 restart all
docker exec -i kopay_server pm2 restart all
echo -e "\n\n\e[44m * done * \e[49m\n\n"
echo -e "\e[44m * docker ps * \e[49m\n"
docker ps
