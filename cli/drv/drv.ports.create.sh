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
echo "APIHOST [${APIHOST}]" 1>&2
ITEM="ports"
INPUTS=()

# makeBody
makeBody() {
	local NAME="${1}"
	local RADIUS="${2}"
	local ORBIT="${3}"
	read -r -d "" BODY <<-EOF
	{
		"name": "${NAME}",
		"radius": "${RADIUS}",
		"orbit": "${ORBIT}"
	}
	EOF
	printf "${BODY}"
}

# apiGet
apiPost() {
	local URL="${1}"
	local BODY="${2}"
	local RESPONSE=$(curl -s -X POST \
		-H "Content-Type: application/json" \
		-d "${BODY}" \
	"${URL}")
}

# run
run() {
	URL="${APIHOST}"
	URL+="/${ITEM}"
	if [[ -n "${1}" && -n "${2}" ]]; then
		local BODY=$(makeBody "${@}")
		printf "[$(cgreen "INFO")]: api [$(cgreen "list")] ${ITEM} [$(cgreen "${URL}")]... " 1>&2
		echo "[$(ccyan "DONE")]" 1>&2
		echo "${BODY}"
		apiPost "${URL}" "${BODY}"
	else
		echo "[$(corange "ERROR")]: command usage: [$(ccyan " ports.create <port.name> <port.radius> <port.orbit> ")] " 1>&2
	fi
}

# driver
driver "${@}"
