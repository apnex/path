#!/bin/bash
if [[ $0 =~ ^(.*)/[^/]+$ ]]; then
	WORKDIR=${BASH_REMATCH[1]}
fi
source ${WORKDIR}/mod.driver

# inputs
APIHOST="http://localhost"
if [[ -n "${EXPRESS_SERVER_PORT}" ]]; then
	APIHOST+=":${EXPRESS_SERVER_PORT}"
fi
ITEM="nodes"
INPUTS=()

# apiPost
apiPost() {
	local URL="${1}"
	local BODY="${2}"
	local RESPONSE
	#echo "TEST"
	if [[ -n "${BODY}" ]]; then
		RESPONSE=$(curl -s -X POST \
			-H "Content-Type: application/json" \
			-d "${BODY}" \
		"${URL}")
	else
		echo "TESTI"
		RESPONSE=$(curl -s -X POST \
			-H "Content-Type: application/json" \
		"${URL}")
	fi
	printf "${RESPONSE}"
}

# run
run() {
	URL="${APIHOST}"
	if [[ -n "${1}" ]]; then
		URL+="/${ITEM}/${1}/select"
		printf "[$(cgreen "INFO")]: api [$(cgreen "select")] ${ITEM} [$(cgreen "${URL}")]... " 1>&2
		echo "[$(ccyan "DONE")]" 1>&2
		apiPost "${URL}" "{}"
		#apiPost "${URL}" | jq --tab .
	else
		echo "[$(corange "ERROR")]: command usage: [$(ccyan " nodes.select <nodes.id> ")] " 1>&2
	fi
}

# driver
driver "${@}"
