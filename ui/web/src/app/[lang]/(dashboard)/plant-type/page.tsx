import dynamic from "next/dynamic";
import PlantTypeList from "./components/plant-type-table";
import PlantTypeSyncData from "./dispatch/dispatch-plant-type-sync-data";
import AppLoading from "../components/app-loading";

const PlantTypeAddDialog = dynamic(
  () => import("./components/plant-type-add"),
  {
    loading: () => <AppLoading />,
  }
);

export default function PlantTypeListFancy() {
  return (
    <>
      <PlantTypeSyncData />
      <PlantTypeAddDialog />
      <PlantTypeList />
    </>
  );
}
