.items? |
if (length > 0) then map({
	"id": .id,
	"status": .status,
	"gridx": .grid.x,
	"gridy": .grid.y,
	"tags": (.tags? |
		if (length > 0) then
			join(",")
		else "" end
	)
}) else empty end
