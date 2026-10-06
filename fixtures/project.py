"""Контроль подсветки Python."""
from dataclasses import dataclass

@dataclass
class Task:
    name: str
    progress: int = 0

def report(task: Task) -> str:
    # Комментарий, кириллица, escape и числа
    return f"{task.name}\n{task.progress / 100:.0%}"

print(report(Task("Проверка темы", 95)))
