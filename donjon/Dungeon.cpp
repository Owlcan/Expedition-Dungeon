#include "pch.h"
#include <stdexcept>
#include "Dungeon.h"

namespace donjon
{
    Dungeon::Dungeon(size_t row, size_t column) : mRow{ row }, mColumn{ column }
    {
        __super::resize(row * column);
    }

    void Dungeon::Update(size_t row, size_t col, CellType type)
    {
        auto index = row * mRow + col;

        if (index < size()) {
            operator[](index) = type;
        }
        else {
            throw std::range_error("out of range");
        }
    }

    CellType Dungeon::Get(size_t row, size_t col) const
    {
        auto index = row * mRow + col;

        if (index < size()) {
            return operator[](index);
        }
        else {
            throw std::range_error("out of range");
        }
    }
    
    void Dungeon::PlaceEntity(size_t row, size_t col, size_t entityId, CellType entityType)
    {
        if (row >= mRow || col >= mColumn) {
            throw std::range_error("placement position out of range");
        }
        
        // Only allow placing entities in valid spaces (rooms or corridors)
        auto currentCell = Get(row, col);
        if ((static_cast<std::underlying_type_t<CellType>>(currentCell) & 
             static_cast<std::underlying_type_t<CellType>>(CellType::OpenSpace)) == 
             static_cast<std::underlying_type_t<CellType>>(CellType::Nothing)) {
            throw std::invalid_argument("entities can only be placed in open spaces");
        }
        
        // Add entity to the placement list
        EntityPlacement placement;
        placement.row = row;
        placement.col = col;
        placement.id = entityId;
        placement.type = entityType;
        mEntityPlacements.push_back(placement);
        
        // Update the cell to mark it as containing an entity
        Update(row, col, static_cast<CellType>(static_cast<std::underlying_type_t<CellType>>(Get(row, col)) | static_cast<std::underlying_type_t<CellType>>(entityType)));
    }
}