#include "pch.h"
#include "Dungeon.h"
#include "FactoryImpl.h"

namespace donjon
{
	IDungeon* FactoryImpl::CreateDungeon(const Option& option)
	{
		auto dungeon = new Dungeon(option.mRow, option.mColumn);

		InitializeCells(option, *dungeon);
		RoundMask(option, *dungeon);
		EmplaceRooms(option, *dungeon);
		OpenRooms(option, *dungeon);
		LabelRooms(option, *dungeon);
		EmplaceCorridors(option, *dungeon);
		EmplaceStairs(option, *dungeon);
		
		// Add monsters and items to the dungeon
		EmplaceMonsters(option, *dungeon);
		EmplaceItems(option, *dungeon);
		
		ClearDungeon(option, *dungeon);

		return dungeon;
	}

	void FactoryImpl::InitializeCells(const Option& option, Dungeon& dungeon) const
	{
		std::srand(option.mSeed);

		switch (option.mDungeonLayout) {
		case DungeonLayout::Box: {
			break;
		}
		case DungeonLayout::Round: {
			RoundMask(option, dungeon);
			break;
		}
		default:
			throw std::invalid_argument("not implemented");
		}
	}

	void FactoryImpl::RoundMask(const Option& option, Dungeon& dungeon) const
	{
		auto centerRow = option.mRow / 2;
		auto centerCol = option.mColumn / 2;

		for (size_t row{}; row < option.mRow; ++row) {
			for (size_t col{}; col < option.mColumn; ++col) {
				auto distance = sqrt(pow(row - centerRow, 2) + pow(col - centerCol, 2));

				if (distance > centerCol) {
					dungeon.Update(row, col, CellType::Blocked);
				}
			}
		}
	}

	void FactoryImpl::EmplaceRooms(const Option& option, Dungeon& dungeon) const
	{
		switch (option.mRoomLayout) {
		case RoomLayout::Packed:
			PackRooms(option, dungeon);
			break;
		case RoomLayout::Scattered:
			ScatterRooms(option, dungeon);
			break;
		}
	}

	void FactoryImpl::PackRooms(const Option& option, Dungeon& dungeon) const
	{
		auto rowMax = option.mRow / 2;
		auto colMax = option.mColumn / 2;
		size_t roomCount = 0;

		for (size_t row{}; row < rowMax; ++row) {
			for (size_t col{}; col < colMax; ++col) {
				if (CellType::Room == dungeon.Get(row, col)) {
					continue;
				}
				else if ((!row || !col) && (std::rand() % 2)) {
					continue;
				}

				roomCount = EmplaceRoom(dungeon, row, col, roomCount);
			}
		}
	}

	void FactoryImpl::ScatterRooms(const Option& option, Dungeon& dungeon) const
	{

	}

	void FactoryImpl::AllocateRooms(const Option& option) const
	{

	}

	size_t FactoryImpl::EmplaceRoom(Dungeon& dungeon, size_t row, size_t col, size_t roomCount) const
	{
		if (999 == roomCount) {
			return 999;
		}

		return roomCount + 1;
	}

	void FactoryImpl::OpenRooms(const Option& option, Dungeon& dungeon) const
	{

	}

	void FactoryImpl::LabelRooms(const Option& option, Dungeon& dungeon) const
	{

	}

	void FactoryImpl::EmplaceCorridors(const Option& option, Dungeon& dungeon) const
	{

	}

	void FactoryImpl::EmplaceStairs(const Option& option, Dungeon& dungeon) const
	{

	}

	void FactoryImpl::ClearDungeon(const Option& option, Dungeon& dungeon) const
	{

	}
	
	// New monster placement implementation
	void FactoryImpl::EmplaceMonsters(const Option& option, Dungeon& dungeon) const
	{
		// Use the dungeon seed for consistent monster placement
		std::srand(option.mSeed + 1); // Add 1 to get a different but deterministic pattern
		
		// Calculate how many monsters to place based on dungeon size
		// A simple formula: 1 monster per 100 cells, with a minimum of 3
		const size_t totalCells = dungeon.GetRows() * dungeon.GetColumns();
		const size_t monsterCount = std::max<size_t>(3, totalCells / 100);
		
		// Try to place monsters in valid locations (rooms)
		size_t placedMonsters = 0;
		size_t attempts = 0;
		const size_t maxAttempts = monsterCount * 10; // Avoid infinite loop
		
		while (placedMonsters < monsterCount && attempts < maxAttempts) {
			attempts++;
			
			// Pick a random location
			size_t row = std::rand() % dungeon.GetRows();
			size_t col = std::rand() % dungeon.GetColumns();
			
			// Check if the location is valid (in a room, not on stairs or doors)
			CellType cellType = dungeon.Get(row, col);
			bool isRoom = (static_cast<int>(cellType) & static_cast<int>(CellType::Room)) != 0;
			bool hasStairs = (static_cast<int>(cellType) & static_cast<int>(CellType::Stairs)) != 0;
			bool hasDoor = (static_cast<int>(cellType) & static_cast<int>(CellType::DoorSpace)) != 0;
			bool hasMonster = (static_cast<int>(cellType) & static_cast<int>(CellType::Monster)) != 0;
			
			if (isRoom && !hasStairs && !hasDoor && !hasMonster) {
				// Generate a random monster ID (will be mapped to bestiary in JS)
				// Use ranges based on size of the different monster categories
				size_t monsterId;
				
				// Distribution: 40% tiny, 30% small, 20% medium, 7% large, 3% huge
				int monsterSizeRoll = std::rand() % 100;
				if (monsterSizeRoll < 40) {
					// Tiny monster (ID range 0-99)
					monsterId = std::rand() % 100;
				} else if (monsterSizeRoll < 70) {
					// Small monster (ID range 100-199)
					monsterId = 100 + (std::rand() % 100);
				} else if (monsterSizeRoll < 90) {
					// Medium monster (ID range 200-299)
					monsterId = 200 + (std::rand() % 100);
				} else if (monsterSizeRoll < 97) {
					// Large monster (ID range 300-399)
					monsterId = 300 + (std::rand() % 100);
				} else {
					// Huge monster (ID range 400-499)
					monsterId = 400 + (std::rand() % 100);
				}
				
				// Place the monster
				try {
					dungeon.PlaceEntity(row, col, monsterId, CellType::Monster);
					placedMonsters++;
				} catch (const std::exception&) {
					// Skip if placement fails
				}
			}
		}
	}
	
	// New item placement implementation
	void FactoryImpl::EmplaceItems(const Option& option, Dungeon& dungeon) const
	{
		// Use a different seed variation for item placement
		std::srand(option.mSeed + 2); 
		
		// Calculate how many items to place based on dungeon size
		// Similar formula: 1 item per 150 cells, with a minimum of 2
		const size_t totalCells = dungeon.GetRows() * dungeon.GetColumns();
		const size_t itemCount = std::max<size_t>(2, totalCells / 150);
		
		// Try to place items in valid locations (rooms, not on monsters)
		size_t placedItems = 0;
		size_t attempts = 0;
		const size_t maxAttempts = itemCount * 10; 
		
		while (placedItems < itemCount && attempts < maxAttempts) {
			attempts++;
			
			// Pick a random location
			size_t row = std::rand() % dungeon.GetRows();
			size_t col = std::rand() % dungeon.GetColumns();
			
			// Check if the location is valid
			CellType cellType = dungeon.Get(row, col);
			bool isRoom = (static_cast<int>(cellType) & static_cast<int>(CellType::Room)) != 0;
			bool hasMonster = (static_cast<int>(cellType) & static_cast<int>(CellType::Monster)) != 0;
			bool hasItem = (static_cast<int>(cellType) & static_cast<int>(CellType::Item)) != 0;
			
			if (isRoom && !hasMonster && !hasItem) {
				
				// Generate a random item ID (will be mapped to items in JS)
				// Use item ID range 1000-1999 to avoid conflict with monsters
				size_t itemId = 1000 + (std::rand() % 1000);
				
				// Place the item
				try {
					dungeon.PlaceEntity(row, col, itemId, CellType::Item);
					placedItems++;
				} catch (const std::exception&) {
					// Skip if placement fails
				}
			}
		}
	}
}
