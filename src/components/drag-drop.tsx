import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { Stack } from "@mui/material";
import React, { useCallback } from "react";

type DragDropProps<T> = {
  rows: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getId: (item: T) => string;
  onReorder?: (newOrder: T[]) => void;
};

const DragDrop = <T,>({
  rows,
  renderItem,
  getId,
  onReorder,
}: DragDropProps<T>) => {
  const handleOnDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const items = Array.from(rows);
      const [movedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, movedItem);
      onReorder?.(items);
    },
    [rows, onReorder],
  );

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="groups">
        {(provided) => (
          <Stack
            gap={0.5}
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              maxHeight: 300,
              overflowY: "auto",
            }}
          >
            {rows.map((item, index) => {
              const id = getId(item);

              return (
                <Draggable key={id} draggableId={id} index={index}>
                  {(provided, snapshot) => (
                    <Stack
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={provided.draggableProps.style}
                      direction="row"
                      alignItems="center"
                      sx={{
                        backgroundColor: snapshot.isDragging
                          ? "background.paper-tertiary"
                          : "inherit",
                      }}
                      width={"100%"}
                      // height={"100%"}
                    >
                      <Stack
                        {...provided.dragHandleProps}
                        sx={{
                          cursor: "grab",
                          padding: 1,
                        }}
                        width={"100%"}
                      >
                        {renderItem(item, index)}
                      </Stack>
                    </Stack>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </Stack>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DragDrop;
