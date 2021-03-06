import { Table, Popconfirm, Input, Form, Divider, Cascader } from 'antd';
import React, { useState } from "react";
import {
  DeleteOutlined,
  EditOutlined
} from "@ant-design/icons";
import {placeOptions as options} from './ProductList.data.js';

// /**
//  * Show the last place info. Transform the place attribute: e.g. ["zhejiang", "hangzhou", "xihu"] -> "xihu"
//  * @param {*} dataset 
//  */
// function transform(dataset) {
//   let result = JSON.parse(JSON.stringify(dataset));
//   for (let item of result){
//     item.place = item.place[item.place.length - 1];
//   }
//   return result;
// }


const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  // record,
  // index,
  children,
  ...restProps
}) => {
  // const inputNode = (inputType === "number") ? <InputNumber /> : <Input />;
  const inputNode = (dataIndex === "place") ? <Cascader expandTrigger="hover" options={options} /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`
            }
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const ProductList = ({ onEdit, onDelete, products }) => {
  const [form] = Form.useForm();
  let [data, setState] = useState(products.products);

  data = products.products;   

  const [editingKey, setEditingKey] = useState("");
  const isEditing = record => {
    return record.key === editingKey;
  };
  const edit = record => {
    form.setFieldsValue({
      // name: "",
      ...record // Here "record" is the item that is editing.
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async key => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex(item => key === item.key);
      const item = newData[index];
      newData.splice(index, 1, { ...item, ...row });

      setEditingKey("");

      onEdit(newData);
      setState(newData);

    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      editable: false
    },
    {
      title: 'ID',
      dataIndex: 'id',
      editable: false
    },
    {
      title: 'Time Created',
      dataIndex: 'createTime',
      editable: false
    },
    {
      title: 'Price',
      dataIndex: 'price',
      editable: true,
    },
    {
      title: 'Creator',
      dataIndex: 'creator',
      editable: false
    },
    {
      title: 'Category',
      dataIndex: 'category',
      editable: false
    },
    {
      title: 'Place',
      dataIndex: 'place',
      editable: true,
      // Only show the lastest place name. e.g. ["zhejiang", "hangzhou", "xihu"] -> "xihu"
      render: (text, record) => {
        const shortPlace = record.place[record.place.length - 1];
        return (
          shortPlace
        );
      },
    },
    {
      title: 'Actions',
      render: (text, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <a
              onClick={() => save(record.key)}
              style={{ marginRight: 8 }}
            >
              Save
            </a>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <span>
            <EditOutlined
              disabled={editingKey !== ""}
              onClick={() => edit(record)}
            />
            {/* <Button disabled={editingKey !== ""} onClick={() => edit(record)}>
              Edit
            </Button> */}
            <Divider type="vertical" />
            <Popconfirm title="Delete?" onConfirm={() => onDelete(record.id)}>
              {/* <Button>Delete</Button> */}
              <DeleteOutlined />
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  const mergedColumns = columns.map(col => {
    if (!col.editable) {
      // If column is not editable, just return.
      return col;
    }

    // If column is editable:
    return {
      ...col,
      onCell: record => ({
        record,
        // inputType: col.dataIfndex === "age" ? "number" : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record)
      })
    };
  });

  return (
    <Form form={form} component={false}>
      <Table 
        // bordered
        components={{
          body: {
            cell: EditableCell
          }
        }}
        // dataSource={products.products} 
        dataSource={products.products.filter(item => item.visible)}
        columns={mergedColumns}
        // columns={columns} 
      />
    </Form>
  );
};

export default ProductList;