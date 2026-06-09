import Button from "@mui/material/Button";


const TableActionButtons = ({ onView, onEdit, onDelete, onSchedule, isActive }) => {
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

      <Button 
        size = "Small"
        color = "red"
        onClick = {onDelete}
        sx = {{textTransform: "none"}}
        >
          Delete
        </Button>

      <Button 
        size = "Small"
        color = "green"
        disabled = {!isActive} 
        onClick = {onSchedule}
        sx = {{textTransform: "none"}}
        >
          Schedule
        </Button>

    </div>
  );
};

export default TableActionButtons;