import PlantTypeAddDialog from "./components/plant-type-add";
import PlantTypeList from "./components/plant-type-table";
import PlantTypeSyncData from "./dispatch/dispatch-plant-type-sync-data";

export default function PlantTypeListFancy() {
  return (
    <>
      <PlantTypeSyncData />
      <PlantTypeAddDialog />
      <PlantTypeList />
    </>
  );
}
