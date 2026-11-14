import React from "react";
import { Modal, Button } from "react-bootstrap";

const ModalConfirmacion = ({
  mostrar,
  titulo = "Confirmar acción",
  mensaje,
  textoConfirmar = "Confirmar",
  varianteConfirmar = "danger",
  onConfirmar,
  onCancelar,
}) => {
  return (
    <Modal show={mostrar} onHide={onCancelar} centered size="sm">
      <Modal.Header closeButton>
        <Modal.Title className="fs-6 fw-bold">{titulo}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-start small">{mensaje}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button variant={varianteConfirmar} size="sm" onClick={onConfirmar}>
          {textoConfirmar}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalConfirmacion;
