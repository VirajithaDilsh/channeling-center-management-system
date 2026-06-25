import AppRoutes from "./routes/AppRoutes";
import { MedicineProvider } from "./context/MedicineContext.jsx";

function App() {
    return(
        <MedicineProvider>
            <AppRoutes />
        </MedicineProvider>
    );
}

export default App;