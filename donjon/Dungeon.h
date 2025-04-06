#pragma once
#include <vector>
#include "IDungeon.h"

namespace donjon
{
	class Dungeon : protected std::vector<CellType>, public IDungeon
	{
	public:
		Dungeon(size_t row, size_t column);

		void Update(size_t row, size_t col, CellType);
		CellType Get(size_t row, size_t col) const;
		
		// Implement IDungeon methods
		size_t GetRows() const override { return mRow; }
		size_t GetColumns() const override { return mColumn; }
		CellType GetCellType(size_t row, size_t col) const override { return Get(row, col); }
		
		void PlaceEntity(size_t row, size_t col, size_t entityId, CellType entityType) override;
		std::vector<EntityPlacement> GetEntityPlacements() const override { return mEntityPlacements; }

	private:
		size_t mRow{};
		size_t mColumn{};
		std::vector<EntityPlacement> mEntityPlacements;
	};

}