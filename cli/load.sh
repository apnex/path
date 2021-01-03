#!/bin/bash

PLANETS=$(cat planets.json | jq -c '.[]')

function loadPlanets() {
	IFS=$'\n'
	COUNT=0
	for PLANET in ${PLANETS}; do
		local NAME=$(printf ${PLANET} | jq -r '.name')
		local RADIUS=$(printf ${PLANET} | jq -r '.radius')
		local ORBIT=$(printf ${PLANET} | jq -r '.orbit')
		./cmd.planets.create.sh ${NAME} ${RADIUS} ${ORBIT}
		sleep 1
		COUNT=$((COUNT+1))
	done
}

loadPlanets
