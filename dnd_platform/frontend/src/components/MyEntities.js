import React, { useEffect, useState } from 'react';
import { Card, Button, Collapse, Row, Col } from 'react-bootstrap';

const MyEntities = ({ profile }) => {
    const [shapes, setShapes] = useState([]);
    const [open, setOpen] = useState(false); // состояние раскрытия

    const getMyEntities = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/profile/getEntities/${profile.id}/`);
            if (!response.ok) throw new Error("Не удалось получить данные.");

            const data = await response.json();
            const entityNames = data.map(entity =>
                entity.map.shapes.map(shape => shape.name)
            ).flat();

            setShapes(entityNames);
        } catch (error) {
            console.error("Ошибка при загрузке сущностей:", error);
        }
    };

    useEffect(() => {
        if (profile && profile.id) {
            getMyEntities();
        }
    }, [profile]);

    return (
        <div className="container mt-4">
            <Button
                onClick={() => setOpen(!open)}
                aria-controls="entity-collapse"
                aria-expanded={open}
                variant="primary"
            >
                {open ? 'Скрыть сущности' : 'Показать сущности'}
            </Button>

            <Collapse in={open}>
                <div id="entity-collapse" className="mt-3">
                    <Row xs={1} sm={2} md={3} lg={4} className="g-3">
                        {shapes.length > 0 ? (
                            shapes.map((name, index) => (
                                <Col key={index}>
                                    <Card className="h-100 shadow-sm">
                                        <Card.Body>
                                            <Card.Title>
                                                {name ? name : 'Без имени'}
                                            </Card.Title>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            <p>Нет сущностей для отображения.</p>
                        )}
                    </Row>
                </div>
            </Collapse>
        </div>
    );
};

export { MyEntities };
