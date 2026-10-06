// Управление проектами: проверка кириллицы и подсветки
const tasks = [
  { name: 'Разработать тему', done: true, progress: 95 },
  { name: 'Проверить стили', done: false, progress: 20 },
];
function nextTask(projectTasks) {
  return projectTasks.find(task => !task.done);
}
console.log(nextTask(tasks));
