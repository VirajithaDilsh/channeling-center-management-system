import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const TableActionButtons = ({ onView, onEdit, onDelete }) => {
  return (
    <div className="flex gap-1 justify-center">

      <IconButton color="primary" onClick={onView}>
        <VisibilityIcon />
      </IconButton>

      <IconButton color="secondary" onClick={onEdit}>
        <EditIcon />
      </IconButton>

      <IconButton color="error" onClick={onDelete}>
        <DeleteIcon />
      </IconButton>

    </div>
  );
};

export default TableActionButtons;