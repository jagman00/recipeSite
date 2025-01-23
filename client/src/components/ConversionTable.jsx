import React from "react";

const ConversionTable = ({ visible, onClose }) => {
  if (!visible) return null;

  return (
    <div className="conversionModalOverlay" onClick={onClose}>
      <div
        className="conversionModalContent"
        onClick={(e) => e.stopPropagation()} // Prevent closing the modal when clicking inside
      >
        <h3>Quick Kitchen Conversions</h3>
        <p>
          Quickly reference common kitchen conversions for volume and weight.
        </p>

        <h4>Volume Conversions</h4>
        <table className="conversionTable">
          <thead>
            <tr>
              <th>US Customary</th>
              <th>Metric Equivalent</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1 teaspoon</td>
              <td>5 mL</td>
            </tr>
            <tr>
              <td>1 tablespoon</td>
              <td>15 mL</td>
            </tr>
            <tr>
              <td>1 cup (8 fl oz)</td>
              <td>250 mL</td>
            </tr>
            <tr>
              <td>4 cups (1 quart)</td>
              <td>950 mL</td>
            </tr>
            <tr>
              <td>1 gallon (4 quarts)</td>
              <td>3.8 L</td>
            </tr>
          </tbody>
        </table>

        <h4>Weight Conversions</h4>
        <table className="conversionTable">
          <thead>
            <tr>
              <th>US Customary</th>
              <th>Metric Equivalent</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1 ounce</td>
              <td>28 grams</td>
            </tr>
            <tr>
              <td>8 ounces (1/2 lb)</td>
              <td>227 grams</td>
            </tr>
            <tr>
              <td>16 ounces (1 lb)</td>
              <td>454 grams</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConversionTable;
