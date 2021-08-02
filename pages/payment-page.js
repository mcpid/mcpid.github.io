import { useCallback, useMemo, useState } from "react";
import { SHA256 } from "crypto-js";
import axios from "axios";

const credentials = {
  api_key: "9dVaW7NtBq9NcV0eEyQZ",
  secret_key: "qXJUtSb5S2",
  hash_key: "zlmeyvdqNPjkVx5",
};

// const credentials = {
//   merchant_index: "MCP00000001",
//   api_key: "lxXCYG98YGDh4K2dmW4t",
//   secret_key: "22S1TlU5pZ",
//   hash_key: "ioGAEzxPM9JwHDd",
//   role: "admin",
// };

const POST_URL = "https://api-stg.mcpayment.id/payment-page/payment";
// const POST_URL = "http://localhost:3001/payment";

const numeric = "0123456789";
const numericLen = numeric.length;

function random(max) {
  return Math.floor(Math.random() * max);
}

function randomNumberString(len) {
  let finalStr = "";
  for (let i = 0; i < len; i++) {
    const index = random(numericLen);
    finalStr += numeric.charAt(index);
  }
  return finalStr;
}

function SectionTitle({ title, paddingTop }) {
  return (
    <div className={`grid grid-cols-8 gap-4 mt-${paddingTop}`}>
      <div className={`col-span-8 text-sm font-extrabold`}>{title}</div>
    </div>
  );
}

function InputRow({
  paddingTop,
  desc,
  type,
  value,
  setValue,
  disabled,
  onChange,
  inputWidth,
  minValue,
  maxValue,
  withRandom,
}) {
  return (
    <div
      className={`grid grid-cols-8 gap-4 ${
        paddingTop ? "pt-" + paddingTop : ""
      }`}
    >
      <span className="col-span-2 py-2">{desc}</span>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={onChange}
        className={`col-span-${inputWidth} border py-2 px-3 text-grey-darkest rounded`}
        {...{
          min: minValue,
          max: maxValue,
          step: minValue,
        }}
      />
      {withRandom ? (
        <button
          disabled={disabled}
          onClick={() => {
            setValue(randomNumberString(6));
          }}
          className="col-span-2 border py-2 px-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded"
        >
          Random
        </button>
      ) : null}
    </div>
  );
}

function useInputRow(desc, type, defaultValue, options = {}) {
  const [value, setValue] = useState(defaultValue);

  const { withRandom, minValue, maxValue, paddingTop, disabled } = options;

  const inputWidth = withRandom ? 4 : 6;

  const onChange = useMemo(() => {
    switch (type) {
      case "number":
        return (e) => {
          setValue(Number(e.target.value));
        };
      case "text":
      default:
        return (e) => {
          setValue(e.target.value);
        };
    }
  }, [type]);

  const reset = useCallback(() => {
    setValue(defaultValue);
  }, [setValue]);

  const component = useMemo(
    () => (
      <InputRow
        {...{
          paddingTop,
          desc,
          type,
          value,
          setValue,
          disabled,
          onChange,
          inputWidth,
          minValue,
          maxValue,
          withRandom,
        }}
      />
    ),
    [value]
  );

  return [component, value, reset];
}

function ItemDetails({ items, setItems, disabled }) {
  const onChange = (i, value) => {
    setItems((items) => {
      const newItems = [...items];
      newItems[i] = value;
      return newItems;
    });
  };

  const onDelete = (i) => () => {
    const _items = [...items];
    const before = [...items.splice(0, i)];
    const after = [..._items.splice(i + 1, _items.length)];
    console.log("Before", before);
    console.log("After", after);
    setItems([...before, ...after]);
  };

  const onAdd = () => {
    setItems([
      ...items,
      {
        itemId: "",
        name: "",
        amount: 0,
        qty: 1,
      },
    ]);
  };

  return (
    <>
      {items.map((item, i) => {
        return (
          <div key={i} className="mt-4 p-4 border rounded">
            <InputRow
              {...{
                paddingTop: 0,
                desc: "Item ID",
                type: "text",
                value: item.itemId,
                setValue: (value) => {
                  onChange(i, { ...item, itemId: value });
                },
                disabled,
                onChange: (e) => {
                  onChange(i, { ...item, itemId: e.target.value });
                },
                inputWidth: 6,
                minValue: undefined,
                maxValue: undefined,
                withRandom: false,
              }}
            />

            <InputRow
              {...{
                paddingTop: 4,
                desc: "Item Name",
                type: "text",
                value: item.name,
                setValue: (value) => {
                  onChange(i, { ...item, name: value });
                },
                disabled,
                onChange: (e) => {
                  onChange(i, { ...item, name: e.target.value });
                },
                inputWidth: 6,
                minValue: undefined,
                maxValue: undefined,
                withRandom: false,
              }}
            />

            <InputRow
              {...{
                paddingTop: 4,
                desc: "Item Amount",
                type: "number",
                value: item.amount,
                setValue: (value) => {
                  onChange(i, { ...item, amount: value });
                },
                disabled,
                onChange: (e) => {
                  onChange(i, { ...item, amount: Number(e.target.value) });
                },
                inputWidth: 6,
                minValue: 1,
                withRandom: false,
              }}
            />

            <InputRow
              {...{
                paddingTop: 4,
                desc: "Item Qty",
                type: "number",
                value: item.qty,
                setValue: (value) => {
                  onChange(i, { ...item, qty: value });
                },
                disabled,
                onChange: (e) => {
                  onChange(i, { ...item, qty: Number(e.target.value) });
                },
                inputWidth: 6,
                minValue: 1,
                withRandom: false,
              }}
            />

            <div className="grid grid-cols-6 gap-4 pt-4">
              <div className="col-span-5"></div>
              <button
                disabled={disabled}
                onClick={onDelete(i)}
                className="col-span-1 text-xs border py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded"
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}

      <div className="grid grid-cols-8 mt-4">
        <div className="col-span-6"></div>
        <button
          disabled={disabled}
          onClick={onAdd}
          className="col-span-2 border py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded"
        >
          Add Item
        </button>
      </div>
    </>
  );
}

function SelectedChannels({ channels, setChannels, disabled }) {
  const onChange = (i, value) => {
    setChannels((channels) => {
      const newItems = [...channels];
      newItems[i] = value;
      return newItems;
    });
  };

  const onDelete = (i) => () => {
    const _channels = [...channels];
    const before = [..._channels.splice(0, i)];
    const after = [..._channels.splice(i + 1, _channels.length)];
    console.log("Before", before);
    console.log("After", after);
    setChannels([...before, ...after]);
  };

  const onAdd = () => {
    setChannels([
      ...channels,
      {
        channel: "",
        acq: "",
      },
    ]);
  };

  return (
    <>
      {channels.map((ch, i) => {
        return (
          <div key={i} className="mt-4 p-4 border rounded">
            <InputRow
              {...{
                paddingTop: 4,
                desc: "Channel",
                type: "text",
                value: ch.channel,
                setValue: (value) => {
                  onChange(i, { ...ch, channel: value.toUpperCase() });
                },
                disabled,
                onChange: (e) => {
                  onChange(i, { ...ch, channel: e.target.value.toUpperCase() });
                },
                inputWidth: 6,
                minValue: undefined,
                maxValue: undefined,
                withRandom: false,
              }}
            />

            <InputRow
              {...{
                paddingTop: 4,
                desc: "Acquiring",
                type: "text",
                value: ch.acq,
                setValue: (value) => {
                  onChange(i, { ...ch, acq: value.toUpperCase() });
                },
                disabled:
                  disabled || (ch.channel !== "CARD" && ch.channel !== "QRIS"),
                onChange: (e) => {
                  onChange(i, { ...ch, acq: e.target.value.toUpperCase() });
                },
                inputWidth: 6,
                minValue: undefined,
                maxValue: undefined,
                withRandom: false,
              }}
            />

            <div className="grid grid-cols-6 gap-4 pt-4">
              <div className="col-span-5"></div>
              <button
                disabled={disabled}
                onClick={onDelete(i)}
                className="col-span-1 text-xs border py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded"
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}

      <div className="grid grid-cols-8 mt-4">
        <div className="col-span-6"></div>
        <button
          disabled={disabled}
          onClick={onAdd}
          className="col-span-2 border py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded"
        >
          Add Channel
        </button>
      </div>
    </>
  );
}

const randomOrderId = randomNumberString(6);
const randomExternalId = randomNumberString(6);

const defaultItems = [
  {
    itemId: "item-002",
    name: "Baju",
    amount: 500,
    qty: 1,
  },
  {
    itemId: "item-001",
    name: "Celana",
    amount: 500,
    qty: 1,
  },
];

const defaultChannels = [
  { channel: "CARD", acq: "BCACC" },
  { channel: "SHOPEEPAY", acq: "" },
];

export default function PaymentPage() {
  const [disabled, setDisabled] = useState(false);
  const [responseString, setResponseString] = useState("");
  const [paymentUrl, setPaymentUrl] = useState(null);

  // order details
  const [orderIdComponent, orderId, resetOrderId] = useInputRow(
    "Order Id",
    "text",
    randomOrderId,
    { withRandom: true, paddingTop: 4, disabled }
  );
  const [externalIdComponent, externalId, resetExternalId] = useInputRow(
    "External Id",
    "text",
    randomExternalId,
    { withRandom: true, paddingTop: 4, disabled }
  );
  const [amountComponent, amount, resetAmount] = useInputRow(
    "Amount",
    "number",
    1000,
    { minValue: 1000, paddingTop: 4, disabled }
  );
  const [descriptionComponent, description, resetDescription] = useInputRow(
    "Description",
    "text",
    "Pembayaran baru",
    { paddingTop: 4, disabled }
  );

  // customer details
  const [customerFullNameComponent, customerFullName, resetCustomerFullName] =
    useInputRow("Full Name", "text", "Juni Doe", {
      paddingTop: 4,
      disabled,
    });
  const [customerEmailComponent, customerEmail, resetCustomerEmail] =
    useInputRow("Email", "text", "juni.doe@email.com", {
      paddingTop: 4,
      disabled,
    });
  const [customerPhoneComponent, customerPhone, resetCustomerPhone] =
    useInputRow("Phone", "text", "089650387782", {
      paddingTop: 4,
      disabled,
    });
  const [customerAddressComponent, customerAddress, resetCustomerAddress] =
    useInputRow("Address", "text", "Tanah Abang, Jakarta Pusat", {
      paddingTop: 4,
      disabled,
    });

  // billing address
  const [billingFullNameComponent, billingFullName, resetBillingFullName] =
    useInputRow("Full Name", "text", "Juni Doe", {
      paddingTop: 4,
      disabled,
    });
  const [billingPhoneComponent, billingPhone, resetBillingPhone] = useInputRow(
    "Phone",
    "text",
    "089650387782",
    {
      paddingTop: 4,
      disabled,
    }
  );
  const [billingAddressComponent, billingAddress, resetBillingAddress] =
    useInputRow("Address", "text", "Tanah Abang, Jakarta Pusat", {
      paddingTop: 4,
      disabled,
    });
  const [billingCityComponent, billingCity, resetBillingCity] = useInputRow(
    "City",
    "text",
    "Jakarta",
    {
      paddingTop: 4,
      disabled,
    }
  );
  const [billingPostComponent, billingPost, resetBillingPost] = useInputRow(
    "Postal Code",
    "text",
    "10240",
    {
      paddingTop: 4,
      disabled,
    }
  );
  const [billingCountryComponent, billingCountry, resetBillingCountry] =
    useInputRow("Country", "text", "ID", {
      paddingTop: 4,
      disabled,
    });

  // shipping address
  const [shippingFullNameComponent, shippingFullName, resetShippingFullName] =
    useInputRow("Full Name", "text", "Juni Doe", {
      paddingTop: 4,
      disabled,
    });
  const [shippingPhoneComponent, shippingPhone, resetShippingPhone] =
    useInputRow("Phone", "text", "089650387782", {
      paddingTop: 4,
      disabled,
    });
  const [shippingAddressComponent, shippingAddress, resetShippingAddress] =
    useInputRow("Address", "text", "Tanah Abang, Jakarta Pusat", {
      paddingTop: 4,
      disabled,
    });
  const [shippingCityComponent, shippingCity, resetShippingCity] = useInputRow(
    "City",
    "text",
    "Jakarta",
    {
      paddingTop: 4,
      disabled,
    }
  );
  const [shippingPostComponent, shippingPost, resetShippingPost] = useInputRow(
    "Postal Code",
    "text",
    "10240",
    {
      paddingTop: 4,
      disabled,
    }
  );
  const [shippingCountryComponent, shippingCountry, resetShippingCountry] =
    useInputRow("Country", "text", "ID", {
      paddingTop: 4,
      disabled,
    });

  // item details
  const [items, setItems] = useState(defaultItems);

  // channels
  const [channels, setChannels] = useState(defaultChannels);

  // additional data
  const [saveCard, setSaveCard] = useState(true);
  const [callbackUrlComponent, callbackUrl, resetCallbackUrl] = useInputRow(
    "Callback URL",
    "text",
    "https://tokentest.free.beeceptor.com",
    {
      paddingTop: 4,
      disabled,
    }
  );
  const [successUrlComponent, successUrl, resetSuccessUrl] = useInputRow(
    "Success URL",
    "text",
    "https://qspage.vercel.app/decode?success=true",
    {
      paddingTop: 4,
      disabled,
    }
  );
  const [failedUrlComponent, failedUrl, resetFailedUrl] = useInputRow(
    "Failed URL",
    "text",
    "https://qspage.vercel.app/decode?success=false",
    {
      paddingTop: 4,
      disabled,
    }
  );

  const onClickReset = () => {
    [
      resetOrderId,
      resetExternalId,
      resetAmount,
      resetDescription,
      resetCustomerFullName,
      resetCustomerEmail,
      resetCustomerPhone,
      resetCustomerAddress,
      resetBillingFullName,
      resetBillingPhone,
      resetBillingAddress,
      resetBillingCity,
      resetBillingPost,
      resetBillingCountry,
      resetShippingFullName,
      resetShippingPhone,
      resetShippingAddress,
      resetShippingCity,
      resetShippingPost,
      resetShippingCountry,
      resetCallbackUrl,
      resetSuccessUrl,
      resetFailedUrl,
      () => {
        setItems(defaultItems);
        setChannels(defaultChannels);
        setSaveCard(true);
      },
    ].forEach((execute) => {
      execute();
    });
  };

  const onClickExecute = async () => {
    if (disabled) {
      return;
    }

    setDisabled(true);
    setPaymentUrl(null);
    const signature = SHA256(
      credentials.hash_key + externalId + orderId
    ).toString();

    const headers = {
      Authorization: "Basic OWRWYVc3TnRCcTlOY1YwZUV5UVo6cVhKVXRTYjVTMg==",
      // "parent-id": "MCP00000001",
      // "merchant-id": "MCP2020120023",
      // "sub-merchant-id": "merchanttest",
      "x-req-signature": signature,
    };

    const body = {
      order_id: orderId,
      external_id: externalId,
      amount: amount,
      description: description,
      customer_details: {
        full_name: customerFullName,
        email: customerEmail,
        phone: customerPhone,
        address: customerAddress,
      },
      item_details: items.length
        ? items.map((i) => ({
            item_id: i.itemId,
            name: i.name,
            amount: i.amount,
            qty: i.qty,
          }))
        : undefined,
      selected_channels: channels.map((ch) => ({
        channel: ch.channel,
        acq:
          ch.channel === "CARD" || ch.channel === "QRIS" ? ch.acq : undefined,
      })),
      billing_address: {
        full_name: billingFullName,
        phone: billingPhone,
        address: billingAddress,
        city: billingCity,
        postal_code: billingPost,
        country: billingCountry,
      },
      shipping_address: {
        full_name: shippingFullName,
        phone: shippingPhone,
        address: shippingAddress,
        city: shippingCity,
        postal_code: shippingPost,
        country: shippingCountry,
      },
      save_card: saveCard,
      callback_url: callbackUrl,
      success_redirect_url: successUrl,
      failed_redirect_url: failedUrl,
    };

    console.log(body);

    try {
      const response = await axios.request({
        method: "POST",
        url: POST_URL,
        data: body,
        headers,
        validateStatus: (status) => true,
      });

      if (response.data) {
        const str = JSON.stringify(response.data, null, 2);
        if (response.data.data) {
          const url = response.data.data.payment_url;
          setPaymentUrl(url);
        }
        setResponseString(str);
      } else {
        alert(`Cannot POST to server, code [${response.status}]`);
      }
    } catch (error) {
      if (error.response) {
        alert(`Cannot POST to server, code [${error.response.status}]`);
      } else {
        alert(`Cannot POST to server`);
        console.error(error);
      }
    } finally {
      setDisabled(false);
    }
  };

  const onClickOpen = () => {
    if (!paymentUrl) return;
    window.open(paymentUrl, "_blank");
  };

  return (
    <div id="app">
      <div className="p-4">
        <h4>MCP-Console</h4>
        <h1 className="text-2xl font-extrabold">Payment Page</h1>
      </div>

      <div className="p-4">
        <div className="__actions grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-row justify-end">
            <button
              disabled={disabled}
              onClick={onClickReset}
              className="px-2 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded mr-2"
            >
              Reset
            </button>
            <button
              disabled={disabled}
              onClick={onClickExecute}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded"
            >
              Execute
            </button>
          </div>
          <div className="flex flex-row justify-end">
            <button
              disabled={!paymentUrl}
              onClick={onClickOpen}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded"
            >
              Open Link
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="__request-dialog request border rounded p-4">
            <SectionTitle title={"Order Details"} paddingTop={0} />
            {orderIdComponent}
            {externalIdComponent}
            {amountComponent}
            {descriptionComponent}

            <SectionTitle title={"Customer Details"} paddingTop={8} />
            {customerFullNameComponent}
            {customerEmailComponent}
            {customerPhoneComponent}
            {customerAddressComponent}

            <SectionTitle title={"Additional Data"} paddingTop={8} />
            <div
              className="grid grid-cols-8 pt-4"
              title="if enabled, channel will select CARD automatically"
              onClick={() => setSaveCard(!saveCard)}
            >
              <div className="col-span-1 flex justify-center items-center py-2">
                <input
                  disabled={disabled}
                  type="checkbox"
                  checked={saveCard}
                  onChange={(e) => {
                    setSaveCard(e.target.checked);
                  }}
                />
              </div>
              <div className="col-span-7 flex justify-start items-center py-2">
                Save Card &nbsp;<span className="font-extrabold">?</span>
              </div>
            </div>
            {callbackUrlComponent}
            {successUrlComponent}
            {failedUrlComponent}

            <SectionTitle title={"Billing Details"} paddingTop={8} />
            {billingFullNameComponent}
            {billingPhoneComponent}
            {billingAddressComponent}
            {billingCityComponent}
            {billingPostComponent}
            {billingCountryComponent}

            <SectionTitle title={"Shipping Details"} paddingTop={8} />
            {shippingFullNameComponent}
            {shippingPhoneComponent}
            {shippingAddressComponent}
            {shippingCityComponent}
            {shippingPostComponent}
            {shippingCountryComponent}

            <SectionTitle title={"Item Details"} paddingTop={8} />
            <ItemDetails
              items={items}
              setItems={setItems}
              disabled={disabled}
            />

            <SectionTitle title={"Selected Channels"} paddingTop={8} />
            <SelectedChannels
              channels={channels}
              setChannels={setChannels}
              disabled={disabled}
            />
          </div>

          <div className="__response-dialog response border rounded p-4">
            <pre>{responseString || "-- RESPONSE"}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
