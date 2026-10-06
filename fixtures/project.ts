// Контроль типов, функций и параметров
interface Task { readonly name: string; progress: number; }
const project: Task = { name: 'Windows 95', progress: 95 };
function report(task: Task): string {
  return `${task.name}: ${task.progress}%`;
}
console.log(report(project));
