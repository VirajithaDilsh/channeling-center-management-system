import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const TableActionButtons = ({ onView, onEdit, onDelete }) => {
  return (
    <div className="flex gap-1 justify-center">
      {onView && (
        <Tooltip title="View">
          <IconButton size="small" color="primary" onClick={onView}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {onEdit && (
        <Tooltip title="Edit">
          <IconButton size="small" color="success" onClick={onEdit}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {onDelete && (
        <Tooltip title="Delete">
          <IconButton size="small" color="error" onClick={onDelete}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
};

export default TableActionButtons;
