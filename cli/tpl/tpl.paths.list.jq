.items? |
if (length > 0) then map({
	"id": .id,
	"status": .status,
	"route": (.route? |
		if (length > 0) then
			join(",")
		else "" end
	)
}) else empty end
