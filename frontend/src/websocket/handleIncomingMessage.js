export const createIncomingMessageHandler = ({
  myShapeId,
  role,
  animateShape,
  setShapes,
  setPlayerShape,
  fetchSessionPlayers,
  setPlayers,
  positionRef,
  sessionId,
  movementLocks,
  setTurnOrder,
  setCurrentTurnShapeId,
  setRooms,
  setCurrentRoom,
  setItems,
  setAllItems,
  currentRoomRef,
  currentRoom,
  setAllShapes,
}) => {
  return (data) => {
    // console.log(
    //   '📨 handleIncomingMessage получил сырое сообщение:',
    //   JSON.stringify(data, null, 2)
    // );

    if (!data || typeof data !== 'object') {
      console.warn('⚠️ Получено некорректное сообщение (не объект):', data);
      return;
    }

    if (data.type === 'connection') {
      console.log('🔗 WebSocket соединение установлено:', data.status);
      return;
    }

    if (!data.action) {
      console.warn('⚠️ Сообщение без поля action. Полный объект:', data);
      return;
    }
    if (data.error) {
      console.error('❌ Ошибка с сервера:', data.error);

      if (data.error === 'too_many_requests') {
        delete movementLocks.current[myShapeId]; // 👈 снимаешь блокировку именно своей фигуры
        console.warn('🚫 Блокировка снята из-за throttle ошибки');
      }

      return;
    }
    switch (data.action) {
      case 'move':
        if (data.payload) {
          const { id, x, y, duration = 400 } = data.payload;

          if (id === myShapeId) {
            console.log(
              '🔄 Получено движение своей фигуры - пропускаем анимацию'
            );
            break;
          }

          // 🔒 Блокировка: если фигура локально заблокирована — игнорируем сообщение
          if (movementLocks.current[id]) {
            console.log(
              '⏳ Локальная анимация в процессе для фигуры',
              id,
              '- игнорируем серверное обновление'
            );
            break;
          }

          console.log(`🚶 Перемещаю фигуру ${id} в (${x}, ${y})`);
          animateShape(id, x, y, duration);
        } else {
          console.warn('⚠️ Пустой payload для действия move');
        }
        break;
      case 'item_create':
        if (data.payload) {
          const item = data.payload;
          const currentRoom = currentRoomRef?.current;

          console.log('🆕 Предмет создан:', item);
          console.log('🧭 Текущая комната:', currentRoom);

          // Обновим полный список
          setAllItems((prev) => [...prev, item]);

          // Покажем предмет в текущей комнате, если он подходит
          const shouldShow =
            (!item.room && !currentRoom) ||
            (currentRoom && item.room === currentRoom.id);

          if (shouldShow) {
            setItems((prev) => [...prev, item]);
            console.log('✅ Отображаем предмет (совпадает с текущей комнатой)');
          } else {
            console.log('🚫 Не отображаем предмет — он из другой комнаты');
          }
        } else {
          console.warn('⚠️ Пустой payload в item_create');
        }
        break;

      case 'item_delete':
        if (data.payload?.id) {
          console.log('🗑️ Предмет удалён:', data.payload.id);
          setItems((prev) =>
            prev.filter((item) => item.id !== data.payload.id)
          );
        } else {
          console.warn('⚠️ Пустой payload в item_delete');
        }
        break;
      case 'create':
        if (data.payload) {
          const newShape = data.payload;

          console.log('🆕 Создаю новую фигуру:', newShape);

          // ✅ Подставим комнату, если не указана (иначе при смене она исчезнет)
          if (newShape.room === undefined || newShape.room === null) {
            newShape.room = currentRoomRef.current?.id ?? 0;
          }

          // ✅ Обновляем как фигуры в комнате, так и все фигуры
          setShapes((prev) => {
            const cleaned = prev.filter(
              (s) =>
                s.id !== 0 &&
                s.id !== '' &&
                s.id !== null &&
                s.id !== newShape.id
            );
            return [...cleaned, newShape];
          });

          setAllShapes((prev) => {
            const exists = prev.some((s) => s.id === newShape.id);
            return exists ? prev : [...prev, newShape];
          });
        } else {
          console.warn('⚠️ Пустой payload для действия create');
        }
        break;

      case 'delete':
        if (data.payload) {
          console.log('🗑️ Удаляю фигуру с id:', data.payload.id);

          setShapes((prev) => prev.filter((s) => s.id !== data.payload.id));
        } else {
          console.warn('⚠️ Пустой payload для действия delete');
        }
        break;

      case 'map_sync':
        if (Array.isArray(data.payload) && data.payload.length > 0) {
          console.log(
            '🌍 Синхронизация карты. Полученные фигуры:',
            data.payload
          );

          const newShapes = data.payload.map((s) => ({ ...s }));
          setShapes(newShapes);

          const myShape = newShapes.find((s) => s.id === myShapeId);
          if (myShape) {
            console.log('✅ Синхронизировал позицию своей фигуры:', myShape);
            setPlayerShape(myShape);
            positionRef.current = { x: myShape.x, y: myShape.y };
          }
        } else {
          console.log('🌍 Пустая синхронизация — обнуляю фигуры');
          setShapes([]);
        }
        break;

      case 'update':
        if (data.payload) {
          const updated = data.payload;

          console.log('🔧 Обновляю фигуру:', updated);

          setShapes((prev) =>
            prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
          );

          if (updated.id === myShapeId && role === 'player') {
            setPlayerShape((prev) => ({ ...prev, ...updated }));

            if (updated.x !== undefined || updated.y !== undefined) {
              positionRef.current = {
                x: updated.x ?? positionRef.current.x,
                y: updated.y ?? positionRef.current.y,
              };
            }
          }
        } else {
          console.warn('⚠️ Пустой payload для действия update');
        }
        break;
      case 'turn_order_update':
        console.log(data.payload);
        if (data.payload?.new_shape_id) {
          console.log(
            '➕ Новый игрок добавлен в очередь:',
            data.payload.new_shape_id
          );
          // Функция для обновления очереди на фронте
          setTurnOrder((prevOrder) => [
            ...prevOrder,
            data.payload.new_shape_id,
          ]);
        } else {
          console.warn('⚠️ Пустой payload в turn_order_update');
        }
        break;
      case 'create_room':
        if (data.payload?.room) {
          console.log(
            '🛏️ Добавляю новую комнату через WebSocket:',
            data.payload.room
          );

          setRooms((prev) => {
            const exists = prev.some((r) => r.id === data.payload.room.id);
            if (exists) {
              console.warn(
                '⚠️ Комната уже существует, не добавляю:',
                data.payload.room.id
              );
              return prev;
            }
            return [...prev, data.payload.room];
          });
        } else {
          console.warn('⚠️ Пустой payload в create_room');
        }
        break;
      case 'switch_room':
        if (data.payload?.room_id) {
          console.log('🛏️ Переключаю комнату через WebSocket:', data.payload);

          setCurrentRoom({
            id: data.payload.room_id,
            background_image: data.payload.background_image || null,
          });
        } else {
          console.warn('⚠️ Пустой payload в switch_room');
        }
        break;
      case 'turn_update':
        console.log(data.payload);
        if (data.payload?.current_shape_id !== undefined) {
          console.log(
            '🎯 Сейчас ходит фигура с id:',
            data.payload.current_shape_id
          );
          // Функция для обновления активного хода
          setCurrentTurnShapeId(data.payload.current_shape_id);
        } else {
          console.warn('⚠️ Пустой payload в turn_update');
        }
        break;
      case 'session_update':
        if (role === 'master') {
          console.log('🎮 Сессия обновлена. Загружаю список игроков...');

          fetchSessionPlayers(sessionId)
            .then((response) => {
              console.log('✅ Игроки сессии обновлены:', response.data);
              setPlayers(response.data);
            })
            .catch((err) =>
              console.error('❌ Не удалось обновить список игроков:', err)
            );
        } else {
          console.log(
            'ℹ️ Получено session_update, но роль не master — пропускаем'
          );
        }
        break;

      default:
        console.warn('⚠️ Неизвестное действие:', data.action);
    }
  };
};
