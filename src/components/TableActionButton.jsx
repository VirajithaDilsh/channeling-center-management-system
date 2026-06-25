import Button from "@mui/material/Button";

const TableActionButtons = ({ onView, onEdit, onDelete }) => {
  return (
    <div className="flex gap-1 justify-center">

      <Button
        size="small"
        color="primary"
        onClick={onView}
        sx={{ textTransform: "none" }}
      >
        View
      </Button>

      <Button
        size="small"
        color="secondary"
        onClick={onEdit}
        sx={{ textTransform: "none" }}
      >
        Edit
      </Button>

    </div>
  );
};

export default TableActionButtons;