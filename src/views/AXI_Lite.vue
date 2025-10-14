<template>
  <TemplateLayout :generated-code="generatedCode" :language="settings.language">
    <template #settings>
      <div class="mb-3">
        <label class="form-label" for="module_name">Module Name:</label>
        <input
          type="text"
          id="module_name"
          class="form-control"
          v-model="settings.module_name"
          placeholder="axi_wrapper"
        />
      </div>

      <div class="mb-3">
        <label class="form-label" for="register_count">Register Count:</label>
        <input
          type="number"
          id="register_count"
          class="form-control"
          v-model.number="settings.register_count"
          min="1"
          max="256"
        />
        <div class="form-text">Number of registers (1-256)</div>
      </div>

      <div class="mb-3">
        <label class="form-label" for="signal_width">Signal Width:</label>
        <select id="signal_width" class="form-select" v-model.number="settings.signal_width">
          <option :value="32">32-bit</option>
          <option :value="64">64-bit</option>
        </select>
        <div class="form-text">AXI data bus width</div>
      </div>
    </template>
  </TemplateLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import TemplateLayout from '../components/TemplateLayout.vue'

const settings = ref({
  module_name: 'axi_wrapper',
  register_count: 4,
  signal_width: 32,
  language: 'verilog',
})

const generatedCode = computed(() => {
  return generateAxiLiteModule(settings.value)
})

function generateAxiLiteModule({
  module_name,
  register_count: registerCount,
  signal_width: signalWidth,
}) {
  // Calculate address width based on register count
  const addressBits = Math.max(
    2,
    Math.ceil(Math.log2(registerCount)) + (signalWidth === 64 ? 3 : 2),
  )

  // Generate register declarations
  const registerDeclarations = Array.from(
    { length: registerCount },
    (_, i) => `  reg [C_S_AXI_DATA_WIDTH-1:0]\tslv_reg${i};`,
  ).join('\n')

  // Generate register initialization in reset block
  const registerReset = Array.from(
    { length: registerCount },
    (_, i) => `      slv_reg${i} <= 0;`,
  ).join('\n')

  // Generate write case statements
  const writeCases = Array.from({ length: registerCount }, (_, i) => {
    const hexValue = i.toString(16).toUpperCase()
    const padWidth = Math.ceil(addressBits / 4)
    const paddedHex = hexValue.padStart(padWidth > 1 ? padWidth : 1, '0')

    return `          ${padWidth}'h${paddedHex}:
            for ( byte_index = 0; byte_index <= (C_S_AXI_DATA_WIDTH/8)-1; byte_index = byte_index+1 )
              if ( S_AXI_WSTRB[byte_index] == 1 )
              begin
                // Respective byte enables are asserted as per write strobes
                // Slave register ${i}
                slv_reg${i}[(byte_index*8) +: 8] <= S_AXI_WDATA[(byte_index*8) +: 8];
              end`
  }).join('\n')

  // Generate default case for write
  const writeDefault = Array.from(
    { length: registerCount },
    (_, i) => `            slv_reg${i} <= slv_reg${i};`,
  ).join('\n')

  // Generate read case statements
  const readCases = Array.from({ length: registerCount }, (_, i) => {
    const hexValue = i.toString(16).toUpperCase()
    const padWidth = Math.ceil(addressBits / 4)
    const paddedHex = hexValue.padStart(padWidth > 1 ? padWidth : 1, '0')

    return `      ${padWidth}'h${paddedHex}   :
        reg_data_out <= slv_reg${i};`
  }).join('\n')

  // Calculate OPT_MEM_ADDR_BITS
  const optMemAddrBits = Math.max(1, Math.ceil(Math.log2(registerCount)) - 1)

  return `\`timescale 1 ns / 1 ps

module ${module_name} #
  (
    // Users to add parameters here

    // User parameters ends
    // Do not modify the parameters beyond this line

    // Width of S_AXI data bus
    parameter integer C_S_AXI_DATA_WIDTH\t= ${signalWidth},
    // Width of S_AXI address bus
    parameter integer C_S_AXI_ADDR_WIDTH\t= ${addressBits}
  )
  (
    // Users to add ports here

    // User ports ends
    // Do not modify the ports beyond this line

    // Global Clock Signal
    input wire  S_AXI_ACLK,
    // Global Reset Signal. This Signal is Active LOW
    input wire  S_AXI_ARESETN,
    // Write address (issued by master, acceped by Slave)
    input wire [C_S_AXI_ADDR_WIDTH-1 : 0] S_AXI_AWADDR,
    // Write channel Protection type. This signal indicates the
    // privilege and security level of the transaction, and whether
    // the transaction is a data access or an instruction access.
    input wire [2 : 0] S_AXI_AWPROT,
    // Write address valid. This signal indicates that the master signaling
    // valid write address and control information.
    input wire  S_AXI_AWVALID,
    // Write address ready. This signal indicates that the slave is ready
    // to accept an address and associated control signals.
    output wire  S_AXI_AWREADY,
    // Write data (issued by master, acceped by Slave)
    input wire [C_S_AXI_DATA_WIDTH-1 : 0] S_AXI_WDATA,
    // Write strobes. This signal indicates which byte lanes hold
    // valid data. There is one write strobe bit for each eight
    // bits of the write data bus.
    input wire [(C_S_AXI_DATA_WIDTH/8)-1 : 0] S_AXI_WSTRB,
    // Write valid. This signal indicates that valid write
    // data and strobes are available.
    input wire  S_AXI_WVALID,
    // Write ready. This signal indicates that the slave
    // can accept the write data.
    output wire  S_AXI_WREADY,
    // Write response. This signal indicates the status
    // of the write transaction.
    output wire [1 : 0] S_AXI_BRESP,
    // Write response valid. This signal indicates that the channel
    // is signaling a valid write response.
    output wire  S_AXI_BVALID,
    // Response ready. This signal indicates that the master
    // can accept a write response.
    input wire  S_AXI_BREADY,
    // Read address (issued by master, acceped by Slave)
    input wire [C_S_AXI_ADDR_WIDTH-1 : 0] S_AXI_ARADDR,
    // Protection type. This signal indicates the privilege
    // and security level of the transaction, and whether the
    // transaction is a data access or an instruction access.
    input wire [2 : 0] S_AXI_ARPROT,
    // Read address valid. This signal indicates that the channel
    // is signaling valid read address and control information.
    input wire  S_AXI_ARVALID,
    // Read address ready. This signal indicates that the slave is
    // ready to accept an address and associated control signals.
    output wire  S_AXI_ARREADY,
    // Read data (issued by slave)
    output wire [C_S_AXI_DATA_WIDTH-1 : 0] S_AXI_RDATA,
    // Read response. This signal indicates the status of the
    // read transfer.
    output wire [1 : 0] S_AXI_RRESP,
    // Read valid. This signal indicates that the channel is
    // signaling the required read data.
    output wire  S_AXI_RVALID,
    // Read ready. This signal indicates that the master can
    // accept the read data and response information.
    input wire  S_AXI_RREADY
  );

  // AXI4LITE signals
  reg [C_S_AXI_ADDR_WIDTH-1 : 0] \taxi_awaddr;
  reg  \taxi_awready;
  reg  \taxi_wready;
  reg [1 : 0] \taxi_bresp;
  reg  \taxi_bvalid;
  reg [C_S_AXI_ADDR_WIDTH-1 : 0] \taxi_araddr;
  reg  \taxi_arready;
  reg [C_S_AXI_DATA_WIDTH-1 : 0] \taxi_rdata;
  reg [1 : 0] \taxi_rresp;
  reg  \taxi_rvalid;

  // Example-specific design signals
  // local parameter for addressing 32 bit / 64 bit C_S_AXI_DATA_WIDTH
  // ADDR_LSB is used for addressing 32/64 bit registers/memories
  // ADDR_LSB = 2 for 32 bits (n downto 2)
  // ADDR_LSB = 3 for 64 bits (n downto 3)
  localparam integer ADDR_LSB = (C_S_AXI_DATA_WIDTH/32) + 1;
  localparam integer OPT_MEM_ADDR_BITS = ${optMemAddrBits};
  //----------------------------------------------
  //-- Signals for user logic register space example
  //------------------------------------------------
  //-- Number of Slave Registers: ${registerCount}
${registerDeclarations}
  wire\t slv_reg_rden;
  wire\t slv_reg_wren;
  reg [C_S_AXI_DATA_WIDTH-1:0]\t reg_data_out;
  integer\t byte_index;
  reg\t aw_en;

  // I/O Connections assignments

  assign S_AXI_AWREADY\t= axi_awready;
  assign S_AXI_WREADY\t= axi_wready;
  assign S_AXI_BRESP\t= axi_bresp;
  assign S_AXI_BVALID\t= axi_bvalid;
  assign S_AXI_ARREADY\t= axi_arready;
  assign S_AXI_RDATA\t= axi_rdata;
  assign S_AXI_RRESP\t= axi_rresp;
  assign S_AXI_RVALID\t= axi_rvalid;

  // Implement axi_awready generation
  // axi_awready is asserted for one S_AXI_ACLK clock cycle when both
  // S_AXI_AWVALID and S_AXI_WVALID are asserted. axi_awready is
  // de-asserted when reset is low.

  always @( posedge S_AXI_ACLK )
  begin
    if ( S_AXI_ARESETN == 1'b0 )
    begin
      axi_awready <= 1'b0;
      aw_en <= 1'b1;
    end
    else
    begin
      if (~axi_awready && S_AXI_AWVALID && S_AXI_WVALID && aw_en)
      begin
        // slave is ready to accept write address when
        // there is a valid write address and write data
        // on the write address and data bus. This design
        // expects no outstanding transactions.
        axi_awready <= 1'b1;
        aw_en <= 1'b0;
      end
      else if (S_AXI_BREADY && axi_bvalid)
      begin
        aw_en <= 1'b1;
        axi_awready <= 1'b0;
      end
      else
      begin
        axi_awready <= 1'b0;
      end
    end
  end

  // Implement axi_awaddr latching
  // This process is used to latch the address when both
  // S_AXI_AWVALID and S_AXI_WVALID are valid.

  always @( posedge S_AXI_ACLK )
  begin
    if ( S_AXI_ARESETN == 1'b0 )
    begin
      axi_awaddr <= 0;
    end
    else
    begin
      if (~axi_awready && S_AXI_AWVALID && S_AXI_WVALID && aw_en)
      begin
        // Write Address latching
        axi_awaddr <= S_AXI_AWADDR;
      end
    end
  end

  // Implement axi_wready generation
  // axi_wready is asserted for one S_AXI_ACLK clock cycle when both
  // S_AXI_AWVALID and S_AXI_WVALID are asserted. axi_wready is
  // de-asserted when reset is low.

  always @( posedge S_AXI_ACLK )
  begin
    if ( S_AXI_ARESETN == 1'b0 )
    begin
      axi_wready <= 1'b0;
    end
    else
    begin
      if (~axi_wready && S_AXI_WVALID && S_AXI_AWVALID && aw_en )
      begin
        // slave is ready to accept write data when
        // there is a valid write address and write data
        // on the write address and data bus. This design
        // expects no outstanding transactions.
        axi_wready <= 1'b1;
      end
      else
      begin
        axi_wready <= 1'b0;
      end
    end
  end

  // Implement memory mapped register select and write logic generation
  // The write data is accepted and written to memory mapped registers when
  // axi_awready, S_AXI_WVALID, axi_wready and S_AXI_WVALID are asserted. Write strobes are used to
  // select byte enables of slave registers while writing.
  // These registers are cleared when reset (active low) is applied.
  // Slave register write enable is asserted when valid address and data are available
  // and the slave is ready to accept the write address and write data.
  assign slv_reg_wren = axi_wready && S_AXI_WVALID && axi_awready && S_AXI_AWVALID;

  always @( posedge S_AXI_ACLK )
  begin
    if ( S_AXI_ARESETN == 1'b0 )
    begin
${registerReset}
    end
    else
    begin
      if (slv_reg_wren)
      begin
        case ( axi_awaddr[ADDR_LSB+OPT_MEM_ADDR_BITS:ADDR_LSB] )
${writeCases}
          default :
          begin
${writeDefault}
          end
        endcase
      end
    end
  end

  // Implement write response logic generation
  // The write response and response valid signals are asserted by the slave
  // when axi_wready, S_AXI_WVALID, axi_wready and S_AXI_WVALID are asserted.
  // This marks the acceptance of address and indicates the status of
  // write transaction.

  always @( posedge S_AXI_ACLK )
  begin
    if ( S_AXI_ARESETN == 1'b0 )
    begin
      axi_bvalid  <= 0;
      axi_bresp   <= 2'b0;
    end
    else
    begin
      if (axi_awready && S_AXI_AWVALID && ~axi_bvalid && axi_wready && S_AXI_WVALID)
      begin
        // indicates a valid write response is available
        axi_bvalid <= 1'b1;
        axi_bresp  <= 2'b0; // 'OKAY' response
      end                   // work error responses in future
      else
      begin
        if (S_AXI_BREADY && axi_bvalid)
          //check if bready is asserted while bvalid is high)
          //(there is a possibility that bready is always asserted high)
        begin
          axi_bvalid <= 1'b0;
        end
      end
    end
  end

  // Implement axi_arready generation
  // axi_arready is asserted for one S_AXI_ACLK clock cycle when
  // S_AXI_ARVALID is asserted. axi_awready is
  // de-asserted when reset (active low) is asserted.
  // The read address is also latched when S_AXI_ARVALID is
  // asserted. axi_araddr is reset to zero on reset assertion.

  always @( posedge S_AXI_ACLK )
  begin
    if ( S_AXI_ARESETN == 1'b0 )
    begin
      axi_arready <= 1'b0;
      axi_araddr  <= 32'b0;
    end
    else
    begin
      if (~axi_arready && S_AXI_ARVALID)
      begin
        // indicates that the slave has acceped the valid read address
        axi_arready <= 1'b1;
        // Read address latching
        axi_araddr  <= S_AXI_ARADDR;
      end
      else
      begin
        axi_arready <= 1'b0;
      end
    end
  end

  // Implement axi_arvalid generation
  // axi_rvalid is asserted for one S_AXI_ACLK clock cycle when both
  // S_AXI_ARVALID and axi_arready are asserted. The slave registers
  // data are available on the axi_rdata bus at this instance. The
  // assertion of axi_rvalid marks the validity of read data on the
  // bus and axi_rresp indicates the status of read transaction.axi_rvalid
  // is deasserted on reset (active low). axi_rresp and axi_rdata are
  // cleared to zero on reset (active low).
  always @( posedge S_AXI_ACLK )
  begin
    if ( S_AXI_ARESETN == 1'b0 )
    begin
      axi_rvalid <= 0;
      axi_rresp  <= 0;
    end
    else
    begin
      if (axi_arready && S_AXI_ARVALID && ~axi_rvalid)
      begin
        // Valid read data is available at the read data bus
        axi_rvalid <= 1'b1;
        axi_rresp  <= 2'b0; // 'OKAY' response
      end
      else if (axi_rvalid && S_AXI_RREADY)
      begin
        // Read data is accepted by the master
        axi_rvalid <= 1'b0;
      end
    end
  end

  // Implement memory mapped register select and read logic generation
  // Slave register read enable is asserted when valid address is available
  // and the slave is ready to accept the read address.
  assign slv_reg_rden = axi_arready & S_AXI_ARVALID & ~axi_rvalid;
  always @(*)
  begin
    // Address decoding for reading registers
    case ( axi_araddr[ADDR_LSB+OPT_MEM_ADDR_BITS:ADDR_LSB] )
${readCases}
      default :
        reg_data_out <= 0;
    endcase
  end

  // Output register or memory read data
  always @( posedge S_AXI_ACLK )
  begin
    if ( S_AXI_ARESETN == 1'b0 )
    begin
      axi_rdata  <= 0;
    end
    else
    begin
      // When there is a valid read address (S_AXI_ARVALID) with
      // acceptance of read address by the slave (axi_arready),
      // output the read dada
      if (slv_reg_rden)
      begin
        axi_rdata <= reg_data_out;     // register read data
      end
    end
  end

  // Add user logic here

  // User logic ends

endmodule`
}
</script>

<style scoped></style>
