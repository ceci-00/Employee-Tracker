const inquirer = require('inquirer');
const mysql = require('mysql2/promise');
const fs = require('fs');
const { connect } = require('http2');

let db;

const connectToDatabase = async () => {
    try {
        db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'pw12',
            database: 'departments_db'
        });
        console.log('Connected to the departments_db database.');
        await seedDatabase();
        mainMenu();
    } catch (err) {
        console.error('Error connecting to the database:', err);
    }
};

const seedDatabase = async () => {
    try {
        const seed = fs.readFileSync('./assets/db/seeds.sql').toString();
        await db.query(seed);
        console.log('Database seeded!');
    } catch (err) {
        console.error('Error seeding the database:', err);
    }
};

const mainMenu = async () => {
    try {
        const { choice } = await inquirer.prompt({
            type: 'list',
            name: 'choice',
            message: 'What would you like to do?',
            choices: ['View All Departments', 'View All Roles', 'View All Employees', 'View Employees by Manager', 'View Employees by Department', 'Add Employee', 'Add Department', 'Add Role', 'Update Employee Role', 'Quit']
        });

        switch (choice) {
            case 'View All Departments':
                viewAllDepartments();
                break;
            case 'View All Roles':
                viewAllRoles();
                break;
            case 'View All Employees':
                viewAllEmployees();
                break;
            case 'View Employees by Manager':
                viewEmployeesByManager();
                break;
            case 'View Employees by Department':
                viewEmployeesByDepartment();
                break;
            case 'Add Employee':
                addEmployee();
                break;
            case 'Add Department':
                addDepartment();
                break;
            case 'Add Role':
                addRole();
                break;
            case 'Update Employee Role':
                updateEmployeeRole();
                break;
            case 'Quit':
                process.exit();
        }
    } catch (err) {
        console.error('Error in main menu:', err);
    }
};

const viewAllDepartments = async () => {
    try {
        console.log('Viewing all departments...\n');
        const [rows] = await db.query('SELECT * FROM department');
        console.table(rows);
        mainMenu();
    } catch (err) {
        console.error('Error in view all departments:', err);
    }
}

const viewAllRoles = async () => {
    try {
        console.log('Viewing all roles...\n');
        const [rows] = await db.query(
            `SELECT
        r.id AS 'Role ID',
        r.title AS 'Job Title',
        d.name AS 'Department',
        r.salary AS 'Salary'
      FROM
        roles r
      LEFT JOIN
        department d ON r.department_id = d.id;`
        );
        console.table(rows);
        mainMenu();
    } catch (err) {
        console.error('Error in view all roles:', err);
    }
};

const viewAllEmployees = async () => {
        try {
            console.log('Viewing all employees...\n');
            const [rows, fields] = await db.query(
                `SELECT
        e.id AS 'Employee ID',
        e.first_name AS 'First Name',
        e.last_name AS 'Last Name',
        r.title AS 'Job Title',
        d.name AS 'Department',
        r.salary AS 'Salary',
        CONCAT(m.first_name, ' ', m.last_name) AS 'Manager'
      FROM
        employee e
        LEFT JOIN roles r ON e.role_id = r.id
        LEFT JOIN department d ON r.department_id = d.id
        LEFT JOIN employee m ON e.manager_id = m.id;`
            );
            console.log('All Employees:');
            console.table(rows);
            mainMenu();
        } catch (err) {
            console.error('Error viewing all employees:', err);
        }
}

const viewEmployeesByManager = async () => {
    try {
        console.log('Viewing employees by manager...\n');
        const [rows] = await db.query('SELECT * FROM employee WHERE manager_id IS NOT NULL');
        console.table(rows);
        mainMenu();
    } catch (err) {
        console.error('Error in view employees by manager:', err);
    }
}

const viewEmployeesByDepartment = async () => {
    try {
        console.log('Employees by Department:');
        const [rows, fields] = await db.query(
            `SELECT
        e.first_name,
        e.last_name,
        d.name AS department
        FROM
        employee e
        JOIN roles r ON e.role_id = r.id
        JOIN department d ON r.department_id = d.id;`
        );
        console.table(rows);
    } catch (err) {
        console.error('Error viewing employees by department:', err);
    }
}

const addEmployee = async () => {
    try {
        console.log('Adding employee...\n');
        const [roles] = await db.query('SELECT * FROM roles'); // Change here
        const [employees] = await db.query('SELECT * FROM employee');
        const roleChoices = roles.map(role => ({ name: role.title, value: role.id }));
        const managerChoices = employees.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }));
        managerChoices.unshift({ name: 'None', value: null });
        const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
            {
                type: 'input',
                name: 'first_name',
                message: 'Enter the employee\'s first name:',
            },
            {
                type: 'input',
                name: 'last_name',
                message: 'Enter the employee\'s last name:',
            },
            {
                type: 'list',
                name: 'role_id',
                message: 'Select the employee\'s role:',
                choices: roleChoices,
            },
            {
                type: 'list',
                name: 'manager_id',
                message: 'Select the employee\'s manager:',
                choices: managerChoices,
            },
        ]);

        await db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [
            first_name,
            last_name,
            role_id,
            manager_id,
        ]);
        console.log('Employee added successfully!');

        // Fetch and display the updated employee table
        console.log('\n Viewing updated employee table:');
        const [rows] = await db.query(`
      SELECT
        e.first_name AS 'First Name',
        e.last_name AS 'Last Name',
        r.title AS 'Role',
        IFNULL(CONCAT(m.first_name, ' ', m.last_name), 'None') AS 'Manager'
      FROM
        employee e
        LEFT JOIN roles r ON e.role_id = r.id
        LEFT JOIN employee m ON e.manager_id = m.id;
    `);
    console.table(rows);
        mainMenu();
    } catch (err) {
        console.error('Error in add employee:', err);
    }
}

const addDepartment = async () => {
    try {
        console.log('Adding department...\n');
        const { name } = await inquirer.prompt({
            type: 'input',
            name: 'name',
            message: 'Enter the department name:'
        });
        await db.query('INSERT INTO department (name) VALUES (?)', [name]);
        console.log('Department added successfully!');
        // View the updated table after adding the new department
        console.log('\nUpdated departments table:');
        const [rows] = await db.query('SELECT * FROM department');
        console.table(rows);
        mainMenu();
    } catch (err) {
        console.error('Error adding department:', err);
    }
}

const addRole = async () => {
    try {
        console.log('Adding role...\n');
        const [departments] = await db.query('SELECT * FROM department');
        const departmentChoices = departments.map(department => ({
            name: department.name,
            value: department.id
        }));

        const { title, salary, department_id } = await inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Enter the role title:'
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Enter the role salary:'
            },
            {
                type: 'list',
                name: 'department_id', // Change here
                message: 'Select the department for the role:',
                choices: departmentChoices
            }
        ]);

        await db.query('INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)', [
            title,
            salary,
            department_id // Change here
        ]);
        console.log('Role added successfully!');

        // View the updated roles table after adding the new role
        console.log('\nUpdated roles table:');
        const [roles] = await db.query(`
      SELECT r.id AS 'Role ID', r.title AS 'Role Title', d.name AS 'Department', r.salary AS 'Salary'
      FROM roles r
      LEFT JOIN department d ON r.department_id = d.id;
    `);
        console.table(roles);

        mainMenu();
    } catch (err) {
        console.error('Error in add role:', err);
    }
}

const updateEmployeeRole = async () => {
    try {
        console.log('Updating employee role...\n');
        const [employees] = await db.query('SELECT * FROM employee');
        const [roles] = await db.query('SELECT * FROM role');
        const employeeChoices = employees.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }));
        const roleChoices = roles.map(role => ({ name: role.title, value: role.id }));
        const { employee_id, role_id } = await inquirer.prompt([
            {
                type: 'list',
                name: 'employee_id',
                message: 'Select the employee to update:',
                choices: employeeChoices
            },
            {
                type: 'list',
                name: 'role_id',
                message: 'Select the employee\'s new role:',
                choices: roleChoices
            }
        ]);
        await db.query('UPDATE employee SET role_id = ? WHERE id = ?', [role_id, employee_id]);
        console.log('Employee role updated successfully!');
        mainMenu();
    } catch (err) {
        console.error('Error in update employee role:', err);
    }
}

connectToDatabase();

